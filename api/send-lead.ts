import { processLeadSubmission } from '../server/leadService';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const result = await processLeadSubmission(payload);
    return res.status(result.statusCode).json(result.body);
  } catch (err: any) {
    console.error('Unhandled Vercel serverless function error in /api/send-lead:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
