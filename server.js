const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const INDEX_PATH = path.join(__dirname, "index.html");

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    const html = fs.readFileSync(INDEX_PATH, "utf8");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  if (req.method === "POST" && req.url === "/api/ask") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      if (!process.env.OPENAI_API_KEY) {
        sendJson(res, 500, {
          error: "Server is missing OPENAI_API_KEY. Add it to your environment."
        });
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(body || "{}");
      } catch {
        sendJson(res, 400, { error: "Invalid JSON payload." });
        return;
      }

      const question = parsed?.question;
      if (!question || !String(question).trim()) {
        sendJson(res, 400, { error: "Question is required." });
        return;
      }

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a scary but cute ghost. You answer intelligently like ChatGPT but in a spooky playful tone. Sometimes be slightly mischievous."
              },
              {
                role: "user",
                content: String(question)
              }
            ],
            temperature: 0.8
          })
        });

        const data = await response.json();

        if (!response.ok) {
          sendJson(res, response.status, { error: data?.error?.message || "OpenAI request failed." });
          return;
        }

        const answer = data?.choices?.[0]?.message?.content;
        if (!answer) {
          sendJson(res, 502, { error: "OpenAI returned an unexpected response." });
          return;
        }

        sendJson(res, 200, { answer });
      } catch {
        sendJson(res, 500, { error: "Failed to contact OpenAI." });
      }
    });
    return;
  }

  sendJson(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
  console.log(`Ghost server listening on http://localhost:${PORT}`);
});
