import express from "express";
import type { Request, Response } from "express";

import dotenv from "dotenv";
dotenv.config();

import { getEmbedding } from "./lib/embed.js";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/embed", async (req: Request, res: Response) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const vector = await getEmbedding(text);

    return res.json({ embedding: vector });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Embedding failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
