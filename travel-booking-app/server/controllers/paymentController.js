// Mock payment controller — simulates Stripe/checkout processing
// In production, replace with real Stripe integration

exports.checkout = async (req, res) => {
  try {
    const { items, totalAmount, currency, destinationId, bookingId } = req.body;

    // Validate request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided for checkout" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a mock transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Mock successful payment response
    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      transactionId,
      amount: totalAmount,
      currency: currency || "USD",
      items: items.map((item) => item.name || item.product || "Item"),
      processedAt: new Date().toISOString(),
      user: req.user.id,
    });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ message: "Payment processing failed" });
  }
};
