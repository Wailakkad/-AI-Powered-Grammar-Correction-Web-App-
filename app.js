require("dotenv").config();
const express = require("express");
const Groq = require("groq-sdk");

const app = express();
const port = 5000;

// Initialize the Groq client with the API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index", {
    corrected: "",
    originalText: "",
  });
});

// Main route for correcting text
app.post("/correct", async (req, res) => {
  const text = req.body.text.trim();
  if (!text) {
    // Return early to avoid sending multiple responses
    return res.render("index", {
      corrected: "Please enter some text to correct",
      originalText: text,
    });
  }

  try {
    // Call the Groq API to get the corrected text
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `correct this text ("${text}")`,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false, // Set to false if you don't need streaming output
    });

    // Extract the corrected text from the API response
    const correctedText = chatCompletion.choices[0]?.message?.content;

    if (!correctedText) {
      return res.render("index", {
        corrected: "Error: Unable to correct the text. Please try again.",
        originalText: text,
      });
    }

    // Render the corrected text
    res.render("index", {
      corrected: correctedText,
      originalText: text,
    });

  } catch (error) {
    console.error("Error:", error);
    return res.render("index", {
      corrected: "Error: Please try again.",
      originalText: text,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
