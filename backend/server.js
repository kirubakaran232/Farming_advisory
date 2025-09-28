const express = require("express");
const mongoose = require("mongoose");
const twilio = require("twilio"); // Add this line
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ---------- MongoDB ----------
mongoose
  .connect("mongodb://127.0.0.1:27017/farm_ad", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// ---------- User model ----------
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", UserSchema);

// ---------- Chat History Model ----------
const ChatHistorySchema = new mongoose.Schema({
  question: String,
  answer: String,
  timestamp: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  email: String, // Store user email for identification
  chatId: String, // Unique identifier for each chat session
  messages: [
    {
      text: String,
      sender: String,
      timestamp: Date,
    },
  ], // Store full conversation
});
const ChatHistory = mongoose.model("ChatHistory", ChatHistorySchema);

// ---------- Fast Ollama Query using Streaming ----------
async function queryOllamaStream(userMessage) {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log("Querying Ollama with streaming:", userMessage);

      let fullResponse = "";

      const response = await axios.post(
        "http://localhost:11434/api/generate",
        {
          model: "llama2",
          prompt: `As an agriculture expert, answer this question concisely: ${userMessage}`,
          stream: true,
          options: {
            temperature: 0.7,
            num_predict: 150, // Limit response length for faster answers
          },
        },
        {
          responseType: "stream",
          timeout: 20000, // 20 second timeout
        }
      );

      response.data.on("data", (chunk) => {
        try {
          const data = JSON.parse(chunk.toString());
          if (data.response) {
            fullResponse += data.response;
          }
          if (data.done) {
            resolve(fullResponse);
          }
        } catch (e) {
          // Continue processing other chunks
        }
      });

      response.data.on("end", () => {
        if (fullResponse) {
          resolve(fullResponse);
        } else {
          reject(new Error("No response received from Ollama"));
        }
      });

      response.data.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ---------- Chat endpoint ----------
app.post("/api/chat", async (req, res) => {
  try {
    const { message, email, chatId, messages = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // console.log("Received question:", message);

    // Get response from Ollama using streaming
    const reply = await queryOllamaStream(message);

    // Prepare messages for storage
    const userMessage = {
      text: message,
      sender: "user",
      timestamp: new Date(),
    };
    const botMessage = { text: reply, sender: "bot", timestamp: new Date() };
    const allMessages = [...messages, userMessage, botMessage];

    // Save to database with email and chatId
    const chatHistory = new ChatHistory({
      question: message,
      answer: reply,
      email: email || "anonymous",
      chatId: chatId || Date.now().toString(),
      messages: allMessages,
    });
    await chatHistory.save();

    res.json({ reply, chatId: chatHistory.chatId });
  } catch (error) {
    console.error("Chat error:", error.message);

    if (error.code === "ECONNREFUSED") {
      res.status(500).json({
        reply: "Ollama is not running. Please start it with: 'ollama serve'",
      });
    } else if (error.message.includes("timeout")) {
      res.status(500).json({
        reply:
          "The AI is taking too long to respond. Please try a simpler question or check if your system has enough resources.",
      });
    } else {
      res.status(500).json({
        reply: "I'm having technical difficulties. Please try again shortly.",
      });
    }
  }
});

// ---------- Get Chat History by Email ----------
app.get("/api/chat-history/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const history = await ChatHistory.find({ email }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// ---------- Get Chat by ID ----------
app.get("/api/chat/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await ChatHistory.findOne({ chatId });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// ---------- Health check endpoint ----------
app.get("/api/health", async (req, res) => {
  try {
    // Quick check if Ollama is running
    const response = await axios.get("http://localhost:11434/api/tags", {
      timeout: 3000,
    });

    res.json({
      status: "healthy",
      ollama: true,
      message: "Ollama is running",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      ollama: false,
      message: "Ollama is not running",
      error: error.message,
    });
  }
});

// ---------- Try a smaller model if llama2 is too slow ----------
app.post("/api/switch-model", async (req, res) => {
  try {
    const { model = "llama2:7b" } = req.body;

    // Test the new model
    const testResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: model,
        prompt: "Hello",
        stream: false,
      },
      {
        timeout: 10000,
      }
    );

    res.json({
      success: true,
      message: `Switched to model: ${model}`,
      response: testResponse.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to switch model",
      error: error.message,
    });
  }
});



// ---------- Auth routes ----------
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email/password required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const newUser = new User({ name, email, password });
    await newUser.save();
    res.json({ success: true, message: "User registered successfully!" });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(400)
      .json({ success: false, message: "Error registering user." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email/password required" });

    const user = await User.findOne({ email, password });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login successful!",
      user: { email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API Ninjas configuration
const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/commodity';
const API_KEY = process.env.API_NINJAS_KEY;

// Get commodity prices
app.get('/api/commodity/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const response = await axios.get(`${API_NINJAS_URL}?name=${name}`, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching commodity data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch commodity data',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get multiple commodities
app.get('/api/commodities', async (req, res) => {
  try {
    const { names } = req.query;
    if (!names) {
      return res.status(400).json({ error: 'Commodity names are required' });
    }

    const commodityList = names.split(',');
    const results = [];

    for (const name of commodityList) {
      try {
        const response = await axios.get(`${API_NINJAS_URL}?name=${name.trim()}`, {
          headers: {
            'X-Api-Key': API_KEY
          }
        });
        
        if (response.data && response.data.length > 0) {
          results.push(response.data[0]);
        }
      } catch (error) {
        console.error(`Error fetching ${name}:`, error);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching commodities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch commodities data',
      message: error.message
    });
  }
});

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
