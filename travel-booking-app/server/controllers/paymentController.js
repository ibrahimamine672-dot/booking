const net = require("net");

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return require("stripe")(key, {
    timeout: 30000,
    maxNetworkRetries: 3,
  });
};

// Diagnostic endpoint — tests whether Stripe's API is reachable from this server
exports.diagnose = async (req, res) => {
  const results = {};

  // 1. DNS resolution check
  results.dns = await new Promise((resolve) => {
    const dns = require("dns");
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

  res.json({
    stripeReachable: results.dns.ok && results.tcp.ok,
    details: results,
    hint:
      !results.dns.ok
        ? "DNS resolution failed — Railway can't resolve api.stripe.com. Try a different deployment region."
        : !results.tcp.ok
          ? "TCP connection failed — Railway is blocking outbound traffic to api.stripe.com:443. Try: (1) Restart the deployment, (2) Deploy to a different region (e.g. us-west), (3) Contact Railway support."
          : !results.stripeKey.ok
            ? "STRIPE_SECRET_KEY is not set in Railway environment variables."
            : "Stripe is reachable — the issue may be with the API key or request parameters.",
  });
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
