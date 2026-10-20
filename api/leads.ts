import { fetchAdminLeads } from '../server/leadService';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const result = await fetchAdminLeads(authHeader);
    return res.status(result.statusCode).json(result.body);
  } catch (err: any) {
    console.error('Unhandled Vercel serverless function error in /api/leads:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
