const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const submitHandler = require("./api/submit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.options("/api/submit", (req, res) => {
  submitHandler(req, res);
});

app.post("/api/submit", (req, res) => {
  submitHandler(req, res);
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Sky9 server running on http://localhost:${PORT}`);
});
