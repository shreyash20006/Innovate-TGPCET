/**
 * Service to handle communications with Zapier Webhooks
 */

const ZAPIER_WEBHOOKS = {
  REGISTRATION: import.meta.env.VITE_ZAPIER_REGISTRATION_WEBHOOK || 'https://hooks.zapier.com/hooks/catch/YOUR_ID/REGISTRATION_TOKEN/',
  NEWSLETTER: import.meta.env.VITE_ZAPIER_NEWSLETTER_WEBHOOK || 'https://hooks.zapier.com/hooks/catch/YOUR_ID/NEWSLETTER_TOKEN/',
  BULK_EMAIL: import.meta.env.VITE_ZAPIER_BULK_EMAIL_WEBHOOK || 'https://hooks.zapier.com/hooks/catch/YOUR_ID/BULK_TOKEN/',
};

export const sendToWebhook = async (type: keyof typeof ZAPIER_WEBHOOKS, data: any) => {
  const url = ZAPIER_WEBHOOKS[type];
  
  if (url.includes('YOUR_ID')) {
    console.warn(`[WebhookService] Using placeholder URL for ${type}. Please set VITE_ZAPIER_${type}_WEBHOOK in .env`);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Zapier webhooks often work better with no-cors or standard CORS depending on setup
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        source: 'Innovate TGPCET Website',
      }),
    });

    // With 'no-cors', we can't see the response body or status, but the request is sent.
    return { success: true };
  } catch (error) {
    console.error(`[WebhookService] Error sending to ${type} webhook:`, error);
    throw error;
  }
};
