const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return require("stripe")(key);
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
    const message =
      err.message?.includes("STRIPE_SECRET_KEY")
        ? "Stripe is not configured — set STRIPE_SECRET_KEY in Railway dashboard."
        : err.type === "StripeInvalidRequestError"
          ? "Payment request rejected by Stripe. Check your Stripe account and API key."
          : `Payment failed: ${err.message}`;
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
    const message =
      err.message?.includes("STRIPE_SECRET_KEY")
        ? "Stripe is not configured — set STRIPE_SECRET_KEY in Railway dashboard."
        : `Failed to confirm payment: ${err.message}`;
    res.status(500).json({ message });
  }
};
