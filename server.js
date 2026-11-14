const express = require("express");
const crypto = require("crypto");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const sessions = new Map();
const DAY = 24 * 60 * 60 * 1000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));
const token = () => crypto.randomBytes(24).toString("hex");
function active(id) {
  const s = sessions.get(id);
  return s && s.expiresAt > Date.now() && !s.revoked ? s : null;
}

app.post("/api/sessions", (req, res) => {
  const id = token().slice(0, 16), ownerToken = token(), shareToken = token();
  sessions.set(id, { id, ownerToken, shareToken, expiresAt: Date.now() + DAY, consented: false, revoked: false, location: null });
  res.json({ id, ownerToken, shareUrl: `${req.protocol}://${req.get("host")}/share/${id}?token=${shareToken}` });
});
app.get("/api/sessions/:id/share-check", (req, res) => {
  const s = active(req.params.id);
  if (!s || req.query.token !== s.shareToken) return res.status(404).json({ error: "This sharing link is invalid or expired." });
  res.json({ active: true, consented: s.consented });
});
app.post("/api/sessions/:id/consent", (req, res) => {
  const s = active(req.params.id);
  if (!s || req.body.token !== s.shareToken) return res.status(404).json({ error: "This sharing link is invalid or expired." });
  s.consented = true; res.json({ ok: true });
});
app.post("/api/sessions/:id/location", (req, res) => {
  const s = active(req.params.id);
  if (!s || req.body.token !== s.shareToken || !s.consented) return res.status(403).json({ error: "Consent is required before sharing location." });
  const { latitude, longitude, accuracy } = req.body;
  if (![latitude, longitude].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return res.status(400).json({ error: "Invalid coordinates." });
  s.location = { latitude, longitude, accuracy: Number.isFinite(accuracy) ? accuracy : null, updatedAt: Date.now() };
  res.json({ ok: true });
});
app.get("/api/sessions/:id", (req, res) => {
  const s = active(req.params.id);
  if (!s || req.get("x-owner-token") !== s.ownerToken) return res.status(404).json({ error: "Session not found." });
  res.json({ consented: s.consented, location: s.location, expiresAt: s.expiresAt });
});
app.post("/api/sessions/:id/revoke", (req, res) => {
  const s = active(req.params.id);
  if (!s || req.body.token !== s.shareToken) return res.status(404).json({ error: "Session not found." });
  s.revoked = true; s.location = null; res.json({ ok: true });
});
app.post("/api/sessions/:id/close", (req, res) => {
  const s = sessions.get(req.params.id);
  if (!s || req.get("x-owner-token") !== s.ownerToken) return res.status(404).json({ error: "Session not found." });
  s.revoked = true; s.location = null; res.json({ ok: true });
});
app.get("/share/:id", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/dashboard/:id", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Naija Vibes preview listening on ${PORT}`));