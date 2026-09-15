// Vercel serverless function: POST /api/translate
// Body: { title: string, description: string, targetLang: "ar" | "en" | "ur" }
// Response: { title: string, description: string }
//
// Requires an ANTHROPIC_API_KEY environment variable set in your Vercel project
// (Project Settings -> Environment Variables). The key is only ever used here,
// server-side — it is never sent to or visible from the browser.

const LANGUAGE_NAMES = {
  ar: "Arabic",
  en: "English",
  ur: "Urdu",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Translation is not configured on this server yet." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (err) { body = {}; }
  }
  const { title = "", description = "", targetLang = "en" } = body || {};

  if (!title && !description) {
    res.status(400).json({ error: "Nothing to translate." });
    return;
  }

  const languageName = LANGUAGE_NAMES[targetLang] || "English";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system:
          "You translate short task-marketplace listings. Translate the given title and description into " +
          languageName +
          ". Preserve the meaning and tone; do not add commentary, explanations, or extra text. " +
          "Respond with ONLY a JSON object of the exact shape {\"title\": \"...\", \"description\": \"...\"} and nothing else " +
          "— no markdown fences, no preamble.",
        messages: [
          {
            role: "user",
            content: `Title: ${title}\n\nDescription: ${description}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: "Translation provider error", detail: errText.slice(0, 300) });
      return;
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    const raw = textBlock ? textBlock.text : "{}";
    const cleaned = raw.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      res.status(502).json({ error: "Could not parse translation response." });
      return;
    }

    res.status(200).json({
      title: parsed.title || title,
      description: parsed.description || description,
    });
  } catch (err) {
    res.status(500).json({ error: "Translation request failed." });
  }
};
