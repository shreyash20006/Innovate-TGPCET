exports.handler = async (event, context) => {
  // 1. Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let payload;
  try {
    // 2. Safely parse JSON body to prevent 500 crashes
    payload = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON format sent from frontend." }),
    };
  }

  const { name, email } = payload;

  // 3. Validate input
  if (!name || !email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Name and email are required." }),
    };
  }

  // 4. Securely get the API Key
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server configuration error: Missing API Key." }),
    };
  }

  try {
    // 5. Call Brevo API
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: email,
        attributes: { FIRSTNAME: name },
        listIds: [2],
        updateEnabled: true // Updates contact if they already exist
      }),
    });

    const data = await response.json();

    // 6. Handle Brevo API errors gracefully
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.message || "Failed to subscribe via Brevo." }),
      };
    }

    // 7. Success Response
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Subscribed successfully!" }),
    };

  } catch (error) {
    // 8. Catch network errors or fetch failures
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error while contacting Brevo." }),
    };
  }
};
