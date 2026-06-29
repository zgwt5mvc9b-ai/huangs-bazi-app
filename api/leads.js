// Vercel serverless function: export captured leads as a CSV file.
//
// Protected by LEADS_EXPORT_PASSWORD (a server-only env var - never give it
// the VITE_ prefix, or it would be bundled into the public JS). This is a
// separate, stronger secret than the admin report password (VITE_ADMIN_PASSWORD),
// since this one guards real customer emails rather than report content.
//
// Usage: GET /api/leads?password=...  -> downloads bazi-leads.csv

import { Redis } from "@upstash/redis";

const LEADS_KEY = "bazi:leads";

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function toCsvField(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const expected = process.env.LEADS_EXPORT_PASSWORD;
  const provided = req.query?.password;
  if (!expected || provided !== expected) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(500).json({ ok: false, error: "Lead storage not configured" });
  }

  const rawItems = await redis.lrange(LEADS_KEY, 0, -1);
  const records = rawItems
    .map((item) => {
      try {
        return typeof item === "string" ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const header = ["Email", "Source", "Coupon", "Timestamp"];
  const rows = records.map((r) =>
    [r.email, r.source, r.coupon, r.ts].map(toCsvField).join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="bazi-leads.csv"');
  return res.status(200).send(csv);
}
