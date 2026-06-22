const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.checkout = async (req, res) => {
  try {
    const { items, totalAmount, currency, destinationId, bookingId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided for checkout" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

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
    console.error("Payment error:", err.message);
    res.status(500).json({ message: "Payment processing failed" });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Missing paymentIntentId" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: paymentIntent.status === "succeeded",
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (err) {
    console.error("Confirm payment error:", err.message);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
};
