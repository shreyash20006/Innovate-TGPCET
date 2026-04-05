const https = require('https');

// Fallback request function in case native fetch is not available (Node < 18)
const makeRequest = (url, options, bodyData) => {
  if (typeof fetch !== 'undefined') {
    return fetch(url, {
      ...options,
      body: bodyData ? JSON.stringify(bodyData) : undefined
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    });
  }

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let data = {};
        try {
          data = JSON.parse(body);
        } catch (e) {
          // Ignore parse errors
        }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data });
      });
    });

    req.on('error', (e) => reject(e));

    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
};

exports.handler = async (event, context) => {
  console.log("Received event:", event.httpMethod, event.path);

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let payload;
  try {
    let bodyStr = event.body || "{}";
    if (event.isBase64Encoded) {
      bodyStr = Buffer.from(bodyStr, 'base64').toString('utf8');
    }
    payload = JSON.parse(bodyStr);
  } catch (err) {
    console.error("JSON Parse Error:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON format sent from frontend.", details: err.message }),
    };
  }

  const { name, email } = payload;

  if (!name || !email) {
    console.warn("Validation failed: Missing name or email");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Name and email are required." }),
    };
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL ERROR: BREVO_API_KEY is missing in environment variables.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server configuration error: Missing API Key." }),
    };
  }

  try {
    console.log(`Sending request to Brevo for: ${email}`);
    
    const response = await makeRequest(
      "https://api.brevo.com/v3/contacts",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": apiKey,
        }
      },
      {
        email: email,
        attributes: { FIRSTNAME: name },
        listIds: [2],
        updateEnabled: true
      }
    );

    if (!response.ok) {
      console.error("Brevo API Error:", response.status, response.data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: response.data.message || "Failed to subscribe via Brevo.",
          details: response.data 
        }),
      };
    }

    console.log("Successfully subscribed:", email);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Subscribed successfully!" }),
    };

  } catch (error) {
    console.error("Internal Server Error while contacting Brevo:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Internal Server Error while contacting Brevo.",
        details: error.message || String(error)
      }),
    };
  }
};
