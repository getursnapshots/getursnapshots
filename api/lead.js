// Decoupled lead ingestion handler
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Accept submissions from the production website or local preview
  const allowedOrigins = [
    "https://www.getursnapshots.com",
    "https://getursnapshots.com",
  ];

  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin) && !origin.includes('localhost') && !origin.includes('run.app')) {
    return res.status(403).json({ error: "Invalid website origin" });
  }

  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "Invalid form data" });
    }

    // Honeypot: add a hidden field named "website" to the form.
    if (body.website) {
      return res.status(200).json({ success: true });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!name || name.length > 120) {
      return res.status(400).json({ error: "Enter a valid name" });
    }

    if (!phone || phone.length > 40) {
      return res.status(400).json({ error: "Enter a valid phone number" });
    }

    if (email.length > 254 || message.length > 3000) {
      return res.status(400).json({ error: "Some fields are too long" });
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({ error: "Enter a valid email" });
    }

    const allowed = (value, max = 200) =>
      typeof value === "string" ? value.trim().slice(0, max) : "";

    const lead = {
      id: `LEAD-${Date.now()}`,
      name,
      email,
      phone,
      message,
      formType: allowed(body.formType, 80) || "Booking",
      service: allowed(body.service, 120),
      bookingDate: allowed(body.bookingDate, 40),
      location: allowed(body.location, 160),
      status: "New",
      createdAt: new Date().toISOString(),
    };

    // Save to local leads file
    try {
      const leadsFile = path.resolve(process.cwd(), 'data/leads.json');
      const dir = path.dirname(leadsFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let existing = [];
      if (fs.existsSync(leadsFile)) {
        try { existing = JSON.parse(fs.readFileSync(leadsFile, 'utf-8')); } catch {}
      }
      existing.unshift(lead);
      fs.writeFileSync(leadsFile, JSON.stringify(existing.slice(0, 300), null, 2), 'utf-8');
    } catch {}

    return res.status(201).json({
      success: true,
      message: "Booking enquiry received",
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return res.status(500).json({
      error: "Unable to submit your enquiry. Please try again.",
    });
  }
}
