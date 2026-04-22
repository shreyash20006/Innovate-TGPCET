import express from "express";
import path from "path";
import fs from "fs";
import { Client } from "@notionhq/client";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Initialize Notion Client
const notion = new Client({
  auth: process.env.NOTION_API_KEY?.replace(/['"]/g, '').trim(),
});

// Clean the DB IDs to remove accidental quotes or newlines from Vercel env vars
const OPPORTUNITIES_DB_ID = process.env.OPPORTUNITIES_DB_ID?.replace(/['"]/g, '').trim();
const COURSES_DB_ID = process.env.COURSES_DB_ID?.replace(/['"]/g, '').trim();
const LEADS_DB_ID = process.env.LEADS_DB_ID?.replace(/['"]/g, '').trim();

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

  // ==========================================
  // Notion API Endpoints
  // ==========================================
  
  app.get("/api/notion/opportunities", async (req, res) => {
    try {
      const response = await (notion.databases as any).query({
        database_id: OPPORTUNITIES_DB_ID,
      });

      const opportunities = response.results.map((page: any) => ({
        id: page.id,
        title: page.properties.Title?.title[0]?.plain_text || 'Untitled',
        type: page.properties.Type?.select?.name || 'General',
        tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
        description: page.properties.Description?.rich_text[0]?.plain_text || '',
        link: page.properties.Link?.url || '#',
        company: page.properties.Company?.rich_text[0]?.plain_text || '',
        deadline: page.properties.Deadline?.date?.start || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: page.properties.Location?.rich_text[0]?.plain_text || '',
      }));

      res.status(200).json(opportunities);
    } catch (error: any) {
      console.error('Error fetching opportunities:', error.message);
      res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
  });

  app.get("/api/notion/courses", async (req, res) => {
    try {
      const response = await (notion.databases as any).query({
        database_id: COURSES_DB_ID,
      });

      const courses = response.results.map((page: any) => ({
        id: page.id,
        title: page.properties.Name?.title[0]?.plain_text || 'Untitled Course',
        platform: page.properties.Platform?.select?.name || 'Unknown',
        level: page.properties.Level?.select?.name || 'All Levels',
        link: page.properties.Link?.url || '#',
        description: page.properties.Description?.rich_text[0]?.plain_text || '',
        duration: page.properties.Duration?.rich_text[0]?.plain_text || '',
      }));

      res.status(200).json(courses);
    } catch (error: any) {
      console.error('Error fetching courses:', error.message);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  app.post("/api/notion/leads", async (req, res) => {
    try {
      const { name, email, phone, branch } = req.body;

      if (!LEADS_DB_ID) {
        throw new Error("LEADS_DB_ID is not configured");
      }

      const properties: any = {
        // The title property is usually named "Name" or "Title" by default. 
        // If the user's database uses a different name for the title column, this will fail.
        // Assuming "Name" is the title column based on previous context.
        Name: { title: [{ text: { content: name || 'No Name Provided' } }] }
      };

      // Notion requires specific property types. 
      // If the columns in Notion are not exactly these types, the API will throw an error.
      if (email) properties.Email = { email: email };
      if (phone) properties.Phone = { phone_number: phone };
      if (branch) properties.Branch = { rich_text: [{ text: { content: branch } }] };

      const response = await notion.pages.create({
        parent: { database_id: LEADS_DB_ID },
        properties: properties
      });

      // Send Welcome Email via Brevo if API key is present
      if (email && process.env.BREVO_API_KEY) {
        try {
          await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": process.env.BREVO_API_KEY,
              "content-type": "application/json"
            },
            body: JSON.stringify({
              sender: {
                name: "Team Innovate TGPCET",
                email: "hello@passionpages.shop"
              },
              to: [
                {
                  email: email,
                  name: name || "Student"
                }
              ],
              subject: "Welcome to Innovate TGPCET! 🚀",
              htmlContent: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                  <h2 style="color: #0f1e34;">Hi ${name ? name.split(' ')[0] : ''}! 👋</h2>
                  <p>Thank you for registering on <strong>Innovate TGPCET</strong>!</p>
                  <p>We help students discover internships, free courses, and career opportunities.</p>
                  
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin-top: 0; font-weight: bold; color: #0f1e34;">Stay connected with us:</p>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                      <li style="margin-bottom: 10px;">
                        <a href="https://t.me/innovatetgpcet" style="color: #0088cc; text-decoration: none; font-weight: bold;">
                          📱 Join our Telegram Channel
                        </a>
                      </li>
                      <li>
                        <a href="https://whatsapp.com/channel/0029VbC3hiw6WaKna525w139" style="color: #25D366; text-decoration: none; font-weight: bold;">
                          💬 Join our WhatsApp Channel
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <p style="margin-bottom: 5px;">Best regards,</p>
                  <p style="font-weight: bold; color: #0f1e34; margin-top: 0;">Team Innovate TGPCET</p>
                </div>
              `
            })
          });
          console.log("Welcome email sent to:", email);
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }
      }

      res.status(200).json({ success: true, message: 'Lead saved successfully!' });
    } catch (error: any) {
      console.error('Error saving lead to Notion:', error);
      res.status(500).json({ error: error.message || 'Failed to save lead' });
    }
  });

  app.post("/api/feedback", (req, res) => {
    try {
      const { rating, message, url } = req.body;
      const feedbackEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        rating,
        message,
        url
      };
      
      const feedbackFile = path.join(process.cwd(), 'feedback.json');
      let feedbackData = [];
      
      if (fs.existsSync(feedbackFile)) {
        const fileContent = fs.readFileSync(feedbackFile, 'utf-8');
        feedbackData = JSON.parse(fileContent);
      }
      
      feedbackData.push(feedbackEntry);
      fs.writeFileSync(feedbackFile, JSON.stringify(feedbackData, null, 2));
      
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving feedback:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  app.post("/api/subscribe", async (req, res) => {
    try {
      const { name, email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const apiKey = process.env.BREVO_API_KEY?.replace(/['"]/g, '').trim();
      if (!apiKey) {
        console.error("BREVO_API_KEY is not configured in Vercel Environment Variables");
        return res.status(500).json({ 
          error: "API Key missing! Please add BREVO_API_KEY in Vercel Settings -> Environment Variables." 
        });
      }

      const response = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": apiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          attributes: { FIRSTNAME: name },
          listIds: [2],
          updateEnabled: true // If the contact already exists, update them instead of throwing an error
        })
      });

      // First get response as text, then parse as JSON to avoid SyntaxError on 204 No Content
      const text = await response.text();
      let data: any = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse Brevo response:", text);
        }
      }

      if (!response.ok) {
        // Brevo returns 400 if contact already exists but updateEnabled is false, 
        // but we set it to true. Still, handle any other errors.
        console.error("Brevo API error:", data);
        return res.status(response.status).json({ error: data.message || "Failed to subscribe" });
      }

      // Send Welcome Email via Brevo
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": apiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            sender: {
              name: "Team Innovate TGPCET",
              email: "hello@passionpages.shop"
            },
            to: [
              {
                email: email,
                name: name || "Student"
              }
            ],
            subject: "Welcome to Innovate TGPCET! 🚀",
            htmlContent: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #0f1e34;">Hi ${name ? name.split(' ')[0] : ''}! 👋</h2>
                <p>Thank you for registering on <strong>Innovate TGPCET</strong>!</p>
                <p>We help students discover internships, free courses, and career opportunities.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin-top: 0; font-weight: bold; color: #0f1e34;">Stay connected with us:</p>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 10px;">
                      <a href="https://t.me/innovatetgpcet" style="color: #0088cc; text-decoration: none; font-weight: bold;">
                        📱 Join our Telegram Channel
                      </a>
                    </li>
                    <li>
                      <a href="https://whatsapp.com/channel/0029VbC3hiw6WaKna525w139" style="color: #25D366; text-decoration: none; font-weight: bold;">
                        💬 Join our WhatsApp Channel
                      </a>
                    </li>
                  </ul>
                </div>
                
                <p style="margin-bottom: 5px;">Best regards,</p>
                <p style="font-weight: bold; color: #0f1e34; margin-top: 0;">Team Innovate TGPCET</p>
              </div>
            `
          })
        });
        console.log("Welcome email sent to:", email);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      res.status(200).json({ success: true, message: "Subscribed successfully!" });
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(500).json({ error: "Failed to process subscription" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const apiKey = process.env.GNEWS_API_KEY;
      
      // Fallback dummy data if API key is missing or API fails
      const fallbackNews = [
        {
          id: 1,
          hook: "OpenAI announces new GPT-4.5...",
          title: "OpenAI announces new GPT-4.5 model with enhanced reasoning capabilities",
          summary: "The new model demonstrates significant improvements in logical reasoning, coding, and mathematics compared to its predecessors.",
          category: "AI",
          url: "https://openai.com/blog",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          isNew: true
        },
        {
          id: 2,
          hook: "Google DeepMind introduces AlphaFold 3...",
          title: "Google DeepMind introduces AlphaFold 3 for predicting molecular structures",
          summary: "AlphaFold 3 can predict the structure and interactions of all life's molecules with unprecedented accuracy.",
          category: "AI",
          url: "https://deepmind.google/discover/blog/",
          date: new Date(Date.now() - 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          isNew: true
        },
        {
          id: 3,
          hook: "Top 10 AI Internships for...",
          title: "Top 10 AI Internships for Summer 2026",
          summary: "A curated list of the best artificial intelligence and machine learning internships available for undergraduate students.",
          category: "Internship",
          url: "#",
          date: new Date(Date.now() - 172800000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          isNew: false
        },
        {
          id: 4,
          hook: "Tech giants ramp up hiring...",
          title: "Tech giants ramp up hiring for Generative AI specialists",
          summary: "Companies like Microsoft, Meta, and Amazon are aggressively recruiting talent with expertise in large language models.",
          category: "Hiring",
          url: "#",
          date: new Date(Date.now() - 259200000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          isNew: false
        }
      ];

      if (!apiKey) {
        console.log("GNEWS_API_KEY is not configured. Using fallback data.");
        return res.json(fallbackNews);
      }

      const url = `https://gnews.io/api/v4/search?q=technology%20OR%20AI%20OR%20jobs&lang=en&apikey=${apiKey}&max=10`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.articles || data.errors) {
        console.log("GNews API returned no articles or an error. Using fallback data.", data.errors);
        return res.json(fallbackNews);
      }

      const articles = data.articles;

      // Filtering and classification logic
      const aiKeywords = ["ai", "artificial intelligence", "machine learning", "generative ai"];
      const jobsKeywords = ["job", "hiring", "recruitment", "fresher", "placement"];
      const internshipKeywords = ["internship", "intern"];

      const processedNews = articles
        .map((article: any, index: number) => {
          const title = article.title || "";
          const desc = article.description || "";
          const content = `${title} ${desc}`.toLowerCase();

          let category = "";
          if (aiKeywords.some(kw => content.includes(kw))) {
            category = "AI";
          } else if (internshipKeywords.some(kw => content.includes(kw))) {
            category = "Internship";
          } else if (jobsKeywords.some(kw => content.includes(kw))) {
            category = "Jobs";
          } else if (content.includes("placement")) {
            category = "Hiring";
          }

          if (!category) return null;

          // Clean title (simplify if too long)
          const cleanTitle = title.length > 80 ? title.substring(0, 77) + "..." : title;
          
          // Hook (first 8 words of title)
          const hook = title.split(" ").slice(0, 8).join(" ") + "...";

          // Summary (1-2 lines)
          const summary = desc.length > 150 ? desc.substring(0, 147) + "..." : desc;

          return {
            id: index + 1,
            hook,
            title: cleanTitle,
            summary,
            category,
            url: article.url,
            date: new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            isNew: true
          };
        })
        .filter(Boolean);

      if (processedNews.length === 0) {
        return res.json(fallbackNews);
      }

      res.json(processedNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      // Fallback on error
      const fallbackNews = [
        {
          id: 1,
          hook: "OpenAI announces new GPT-4.5...",
          title: "OpenAI announces new GPT-4.5 model with enhanced reasoning capabilities",
          summary: "The new model demonstrates significant improvements in logical reasoning, coding, and mathematics compared to its predecessors.",
          category: "AI",
          url: "https://openai.com/blog",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          isNew: true
        }
      ];
      res.json(fallbackNews);
    }
  });


// ─── Spotify OAuth + Search ──────────────────────────────────────────────────

const SPOTIFY_CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const SPOTIFY_REDIRECT_URI  = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/auth/spotify/callback';

// In-memory token store (replace with DB/session in production)
const spotifyTokenStore = new Map<string, { access_token: string; expires_at: number }>();

function getSpotifyToken(sessionId: string): string | null {
  const entry = spotifyTokenStore.get(sessionId);
  if (!entry) return null;
  if (Date.now() > entry.expires_at) { spotifyTokenStore.delete(sessionId); return null; }
  return entry.access_token;
}

app.get('/auth/spotify/login', (_req: any, res: any) => {
  const scopes = [
    'user-read-private', 'user-read-email',
    'user-top-read', 'streaming', 'user-modify-playback-state',
  ].join(' ');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: Math.random().toString(36).substring(2),
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get('/auth/spotify/callback', async (req: any, res: any) => {
  const { code, error } = req.query as Record<string, string>;
  if (error || !code) return res.redirect('/#/music-hub?error=access_denied');
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    });
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: body.toString(),
    });
    const tokens = await tokenRes.json() as any;
    if (!tokens.access_token) throw new Error('No access token');
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    spotifyTokenStore.set(sessionId, {
      access_token: tokens.access_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
    });
    res.redirect(`/#/music-hub?session=${sessionId}`);
  } catch (err) {
    console.error('Spotify callback error:', err);
    res.redirect('/#/music-hub?error=token_exchange_failed');
  }
});

app.get('/api/spotify/me', async (req: any, res: any) => {
  const token = getSpotifyToken(req.query.session as string);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const r = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return res.status(r.status).json({ error: 'Spotify error' });
  res.json(await r.json());
});

app.get('/api/spotify/search', async (req: any, res: any) => {
  const { q, session } = req.query as Record<string, string>;
  if (!q?.trim()) return res.status(400).json({ error: 'q required' });
  const token = getSpotifyToken(session);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const params = new URLSearchParams({ q: q.trim(), type: 'track', limit: '20', market: 'IN' });
  const r = await fetch(`https://api.spotify.com/v1/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return res.status(r.status).json({ error: 'Search failed' });
  const data = await r.json() as any;
  res.json((data.tracks?.items || []).map((t: any) => ({
    id: t.id, name: t.name,
    artists: t.artists.map((a: any) => a.name).join(', '),
    album: t.album.name,
    image: t.album.images?.[0]?.url || '',
    preview_url: t.preview_url,
    duration_ms: t.duration_ms,
    external_url: t.external_urls?.spotify,
  })));
});

app.get('/api/spotify/top-tracks', async (req: any, res: any) => {
  const token = getSpotifyToken(req.query.session as string);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const r = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term', { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return res.status(r.status).json({ error: 'Failed' });
  const data = await r.json() as any;
  res.json((data.items || []).map((t: any) => ({
    id: t.id, name: t.name,
    artists: t.artists.map((a: any) => a.name).join(', '),
    album: t.album.name,
    image: t.album.images?.[0]?.url || '',
    preview_url: t.preview_url,
    duration_ms: t.duration_ms,
    external_url: t.external_urls?.spotify,
  })));
});

// ─── End Spotify ──────────────────────────────────────────────────────────────

// Vite middleware for development

if (process.env.NODE_ENV !== "production") {
  import("vite").then(async (vite) => {
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(viteServer.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export the app for Vercel serverless deployment
export default app;
