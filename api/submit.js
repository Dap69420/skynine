const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://sky9-rose.vercel.app"
];

function getCorsOrigin(origin) {
  if (!origin) {
    return "*";
  }
  return allowedOrigins.includes(origin) ? origin : "";
}

function setCorsHeaders(req, res) {
  const origin = getCorsOrigin(req.headers.origin);
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function clean(value, maxLength = 500) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, maxLength);
}

function validatePayload(payload) {
  const artist = clean(payload.artist, 120);
  const email = clean(payload.email, 160);
  const genre = clean(payload.genre, 120);
  const audioLink = clean(payload.audioLink, 400);
  const notes = clean(payload.notes, 1000);

  if (!artist || !email || !genre || !audioLink || !notes) {
    return { ok: false, error: "Missing required fields" };
  }

  if (!email.includes("@")) {
    return { ok: false, error: "Invalid email" };
  }

  if (!/^https?:\/\//i.test(audioLink)) {
    return { ok: false, error: "Audio link must start with http:// or https://" };
  }

  return {
    ok: true,
    data: { artist, email, genre, audioLink, notes }
  };
}

function buildDiscordPayload(data) {
  return {
    username: "Dap Media Demo",
    avatar_url: "https://i.imgur.com/5qUK4QB.png",
    embeds: [
      {
        title: "New Demo Submission",
        color: 0x008cff,
        fields: [
          { name: "Artist", value: data.artist, inline: true },
          { name: "Email", value: data.email, inline: true },
          { name: "Genre", value: data.genre, inline: true },
          { name: "Audio Link", value: `[Listen here](${data.audioLink})`, inline: false },
          { name: "Notes", value: data.notes, inline: false }
        ],
        footer: { text: `Dap Media Demo | ${new Date().toISOString()}` }
      }
    ]
  };
}

async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ success: false, error: "Webhook is not configured" });
  }

  if (webhookUrl.includes("your-webhook-id") || webhookUrl.includes("your-webhook-token")) {
    return res.status(500).json({ success: false, error: "Webhook placeholder detected. Set DISCORD_WEBHOOK_URL in .env" });
  }

  const validation = validatePayload(req.body || {});
  if (!validation.ok) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  const discordPayload = buildDiscordPayload(validation.data);

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload)
    });

    if (!discordResponse.ok) {
      let discordErrorText = "";
      try {
        discordErrorText = await discordResponse.text();
      } catch (e) {
        discordErrorText = "";
      }
      return res.status(502).json({
        success: false,
        error: "Webhook delivery failed",
        discordStatus: discordResponse.status,
        discordMessage: discordErrorText ? discordErrorText.slice(0, 300) : "No response body"
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = handler;
