const net = require("net");
const dns = require("dns");
const https = require("https");

const STRIPE_TIMEOUT = 60000;

const getStripe = () => {
  const key = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return require("stripe")(key, {
    timeout: STRIPE_TIMEOUT,
    maxNetworkRetries: 3,
    httpAgent: new https.Agent({ keepAlive: true }),
  });
};

// Diagnostic endpoint — tests whether Stripe's API is reachable from this server
exports.diagnose = async (req, res) => {
  // Wrap everything in try/catch so this endpoint NEVER crashes
  try {
    const results = {};

    // 1. DNS resolution check
    results.dns = await new Promise((resolve) => {
      dns.resolve4("api.stripe.com", (err, addresses) => {
        if (err) resolve({ ok: false, error: err.message });
        else resolve({ ok: true, addresses });
      });
    });

    // 2. TCP connectivity check (port 443)
    results.tcp = await new Promise((resolve) => {
      const socket = net.createConnection(443, "api.stripe.com", () => {
        socket.end();
        resolve({ ok: true });
      });
      socket.setTimeout(10000, () => {
        socket.destroy();
        resolve({ ok: false, error: "connection timed out after 10s" });
      });
      socket.on("error", (err) => {
        resolve({ ok: false, error: err.message });
      });
    });

    // 3. Stripe API key check
    results.stripeKey = process.env.STRIPE_SECRET_KEY
      ? { ok: true, prefix: process.env.STRIPE_SECRET_KEY.slice(0, 8) + "..." }
      : { ok: false, error: "STRIPE_SECRET_KEY is not set" };

    // 4. Raw HTTPS test — using Node's built-in https module (not Stripe SDK)
    if (results.dns.ok && results.tcp.ok) {
      // Use a simple GET request — no extra options that older Node might not support
      results.https = await new Promise((resolve) => {
        const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
        const authValue = "Bearer " + stripeKey;
        const req = https.get(
          {
            hostname: "api.stripe.com",
            path: "/v1/balance",
            headers: { Authorization: authValue },
          },
          (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () =>
              resolve({
                ok: res.statusCode < 500,
                statusCode: res.statusCode,
                bodyPreview: body.slice(0, 120),
              })
            );
            res.on("error", (err) => resolve({ ok: false, error: err.message }));
          }
        );
        req.setTimeout(15000, () => {
          req.destroy();
          resolve({ ok: false, error: "HTTPS request timed out after 15s" });
        });
        req.on("error", (err) => resolve({ ok: false, error: err.message }));
      });
    } else {
      results.https = { skipped: true, reason: "prerequisite checks failed" };
    }

    // 5. Full Stripe SDK test — actually make an API call
    if (results.dns.ok && results.tcp.ok && results.stripeKey.ok) {
      try {
        const stripe = getStripe();
        await stripe.balance.retrieve();
        results.sdk = { ok: true };
      } catch (err) {
        results.sdk = {
          ok: false,
          errorType: err.type || "Unknown",
          errorCode: err.code || "",
          message: err.message,
          statusCode: err.statusCode,
        };
      }
    } else {
      results.sdk = { skipped: true, reason: "prerequisite checks failed" };
    }

    const allOk = results.dns.ok && results.tcp.ok && results.stripeKey.ok && results.https?.ok && results.sdk?.ok;

    res.json({
      stripeReachable: allOk,
      details: results,
      hint:
        !results.dns.ok
          ? "DNS resolution failed — Railway can't resolve api.stripe.com. Try a different deployment region."
          : !results.tcp.ok
            ? "TCP connection failed — Railway is blocking outbound traffic to api.stripe.com:443. Try: (1) Restart the deployment, (2) Deploy to a different region (e.g. us-west), (3) Contact Railway support."
            : !results.stripeKey.ok
              ? "STRIPE_SECRET_KEY is not set in Railway environment variables."
              : !results.https?.ok
                ? `Raw HTTPS request to Stripe API failed: ${results.https?.error || "unknown error"}. This means Railway cannot complete an SSL/TLS handshake with api.stripe.com. This is an infrastructure issue with the Railway deployment — try restarting or deploying to a different region.`
                : !results.sdk?.ok
                  ? `Stripe SDK connectivity test failed (but raw HTTPS works!): ${results.sdk?.message}. This indicates the Stripe npm package has an issue in this environment — possibly the fetch polyfill or HTTP agent.`
                  : "All checks passed — Stripe is fully reachable.",
    });
  } catch (err) {
    console.error("❌ Diagnose endpoint crashed:", err);
    res.json({
      stripeReachable: false,
      details: { error: err.message, stack: err.stack?.split("\n").slice(0, 5).join("\n") },
      hint: `Diagnostic endpoint itself crashed: ${err.message}. Check Railway logs for details.`,
    });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { items, totalAmount, currency, destinationId, bookingId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided for checkout" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const stripe = getStripe();
    const amountInCents = Math.round(totalAmount * 100);
    const paymentCurrency = (currency || "USD").toLowerCase();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: paymentCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: req.user.id,
        destinationId: destinationId || "",
        bookingId: bookingId || "",
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      currency: paymentCurrency,
    });
  } catch (err) {
    console.error("❌ Payment error:", err);
    let message;
    if (err.message?.includes("STRIPE_SECRET_KEY")) {
      message = "Stripe is not configured — set STRIPE_SECRET_KEY in Railway dashboard.";
    } else if (err.type === "StripeConnectionError") {
      message =
        "Cannot reach Stripe's servers. This is a network issue from Railway. " +
        "Try: (1) Restart the deployment, (2) Deploy to a different Railway region, " +
        "or (3) Check if api.stripe.com is accessible via Railway logs.";
    } else if (err.type === "StripeInvalidRequestError") {
      message = "Payment request rejected by Stripe. Check your Stripe account and API key.";
    } else {
      message = `Payment failed: ${err.message}`;
    }
    res.status(500).json({ message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Missing paymentIntentId" });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: paymentIntent.status === "succeeded",
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (err) {
    console.error("❌ Confirm payment error:", err);
    let message;
    if (err.message?.includes("STRIPE_SECRET_KEY")) {
      message = "Stripe is not configured — set STRIPE_SECRET_KEY in Railway dashboard.";
    } else if (err.type === "StripeConnectionError") {
      message =
        "Cannot reach Stripe's servers — network connectivity issue. " +
        "Try restarting the Railway deployment or changing the deployment region.";
    } else {
      message = `Failed to confirm payment: ${err.message}`;
    }
    res.status(500).json({ message });
  }
};
