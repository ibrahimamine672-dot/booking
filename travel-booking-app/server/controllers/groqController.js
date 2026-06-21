const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.chatWithGroq = async (req, res) => {
  try {
    const { message } = req.body;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a friendly, knowledgeable travel assistant for a travel booking website called TravelBook. You help users find destinations, suggest itineraries, recommend hotels, and give travel tips. Be concise but helpful. Keep responses under 200 words.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const reply = chatCompletion.choices[0]?.message?.content || "";

    res.json({ reply });
  } catch (error) {
    console.error("Groq AI error:", error.message);
    res.status(500).json({
      message: "Groq AI Error",
      error: error.message,
    });
  }
};
