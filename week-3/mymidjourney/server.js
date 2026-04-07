// MyMidjourney - Gemini 2.5 Flash Image (nano banana) proxy server
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// load .env (no dependency)
try {
  const env = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
  env.split("\n").forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch {}

const PORT = process.env.PORT || 5174;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash-image";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const STYLE_PREFIX =
  "Pure black ink drawing with a black felt-tip pen on plain white paper. " +
  "Strictly monochrome black and white only — absolutely NO color, NO shading, NO fill, NO gradient, NO background. " +
  "Rough, sketchy, wobbly hand-drawn lines. Scribbly, messy, childlike but witty line art. " +
  "Humorous, funny, silly, exaggerated comedic expression. " +
  "Korean webtoon doodle / meme style (병맛 짤 느낌). " +
  "Simple kakaotalk emoticon character similar to '가나디(ganadi)' and '최고심(choigosim)'. " +
  "Thick wobbly outlines, pure single-line cartoon. Subject: ";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

app.post("/api/generate", async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY missing in .env" });
    const userPrompt = (req.body?.prompt || "").trim();
    if (!userPrompt) return res.status(400).json({ error: "prompt is required" });

    const fullPrompt = STYLE_PREFIX + userPrompt;

    const r = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      console.error("Gemini error:", JSON.stringify(data));
      return res.status(r.status).json({ error: data?.error?.message || "Gemini API error", raw: data });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData || p.inline_data);
    if (!imgPart) {
      console.error("No image in response:", JSON.stringify(data));
      return res.status(502).json({ error: "No image returned by Gemini", raw: data });
    }
    const inline = imgPart.inlineData || imgPart.inline_data;
    const mime = inline.mimeType || inline.mime_type || "image/png";
    const dataUrl = `data:${mime};base64,${inline.data}`;

    res.json({ ok: true, prompt: userPrompt, image: dataUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/health", (_, res) => res.json({ ok: true, model: MODEL }));

app.listen(PORT, () => {
  console.log(`\n🖊️  MyMidjourney server running`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → API key: ${API_KEY ? "loaded ✓" : "MISSING ✗"}`);
  console.log(`   → Model:   ${MODEL}\n`);
});
