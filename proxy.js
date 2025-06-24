const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/", async (req, res) => {
  const encoded = req.query.url;
  if (!encoded) {
    return res.status(400).send("Missing 'url' query param");
  }

  let decodedUrl;
  try {
    decodedUrl = Buffer.from(encoded, "base64").toString("utf-8");
  } catch (e) {
    return res.status(400).send("Invalid Base64 encoding");
  }

  if (!/^https?:\/\//.test(decodedUrl)) {
    return res.status(400).send("Only HTTP(S) URLs are allowed");
  }

  try {
    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "NinJaVPN-Proxy/1.0"
      }
    });

    const text = await response.text();

    res.status(response.status);
    res.set("Content-Type", "text/plain");
    res.set("X-Proxied-From", decodedUrl);
    res.send(text);
  } catch (err) {
    res.status(500).send("Proxy fetch failed: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
