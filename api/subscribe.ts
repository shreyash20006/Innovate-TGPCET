import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing BREVO_API_KEY.' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: name },
        listIds: [2],
        updateEnabled: true,
      }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Failed to subscribe via Brevo.',
        details: data,
      });
    }

    return res.status(200).json({ success: true, message: 'Subscribed successfully!' });
  } catch (error: any) {
    console.error('Brevo error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
