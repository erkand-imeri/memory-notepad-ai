import express from "express";
import type { Request, Response } from "express";

import dotenv from "dotenv";
dotenv.config();

import { getEmbedding } from "./lib/embed.js";
import { store, getAll } from "./lib/memory-store.js";
import { cosineSimilarity } from "./lib/similarity.js";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.post("/query", async (req, res) => {
  const { text } = req.body;

  if (!text)
    return res.status(400).json({
      error: "Text is required",
    });

  const inputVector = await getEmbedding(text);
  const stored = getAll();

  if (stored.length === 0)
    return res.status(404).json({
      message: "No entries to search.",
    });

  let bestMatch = stored[0];
  let highest = cosineSimilarity(inputVector, stored[0].vector);

  for (const entry of stored.slice(1)) {
    const score = cosineSimilarity(inputVector, entry.vector);
    if (score > highest) {
      highest = score;
      bestMatch = entry;
    }
  }

  return res.json({ match: bestMatch.text, score: highest });
});

app.post("/save", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Text is required" });

  const vector = await getEmbedding(text);
  store(text, vector);
  res.json({ message: "Saved." });
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
