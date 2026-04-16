export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('BREVO_API_KEY is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call Brevo API
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: email,
        attributes: { FIRSTNAME: name },
        listIds: [2],
        updateEnabled: true,
      }),
    });

    // First get response as text to avoid SyntaxError on 204 No Content
    const text = await response.text();
    let data = {};
    
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse Brevo response:', text);
      }
    }

    // Handle Brevo API errors
    if (!response.ok) {
      console.error('Brevo API Error:', data);
      return res.status(500).json({ 
        error: data.message || 'Failed to subscribe to the list' 
      });
    }

    // Success
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
