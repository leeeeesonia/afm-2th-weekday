const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3001;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY_HERE";

const SYSTEM_PROMPT = `당신은 따뜻하고 공감 능력이 뛰어난 심리상담사입니다.
이름은 "마음이"입니다.

상담 원칙:
- 내담자의 감정을 먼저 공감하고 수용합니다
- 판단하지 않고 경청합니다
- 부드럽고 따뜻한 말투를 사용합니다
- 필요시 열린 질문을 통해 내담자가 스스로 답을 찾도록 돕습니다
- 위기 상황(자해, 자살 등)이 감지되면 전문 상담 기관(정신건강위기상담전화 1577-0199, 자살예방상담전화 1393)을 안내합니다
- 답변은 3~5문장 정도로 간결하게 합니다
- 한국어로 대화합니다`;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 대화 히스토리를 세션별로 관리 (간단 구현)
const sessions = {};

app.post("/api/chat", async (req, res) => {
  const { message, sessionId = "default" } = req.body;

  if (!sessions[sessionId]) {
    sessions[sessionId] = [{ role: "system", content: SYSTEM_PROMPT }];
  }

  sessions[sessionId].push({ role: "user", content: message });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: sessions[sessionId],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices[0].message.content;
    sessions[sessionId].push({ role: "assistant", content: reply });

    // 히스토리가 너무 길어지면 오래된 것 제거 (시스템 프롬프트 유지)
    if (sessions[sessionId].length > 21) {
      sessions[sessionId] = [
        sessions[sessionId][0],
        ...sessions[sessionId].slice(-20),
      ];
    }

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// 대화 초기화
app.post("/api/reset", (req, res) => {
  const { sessionId = "default" } = req.body;
  delete sessions[sessionId];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🧠 심리상담 챗봇 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
