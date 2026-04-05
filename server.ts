import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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

      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        console.error("BREVO_API_KEY is not configured");
        return res.status(500).json({ error: "Newsletter service is not configured" });
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

      const data = await response.json();

      if (!response.ok) {
        // Brevo returns 400 if contact already exists but updateEnabled is false, 
        // but we set it to true. Still, handle any other errors.
        console.error("Brevo API error:", data);
        return res.status(response.status).json({ error: data.message || "Failed to subscribe" });
      }

      res.status(200).json({ success: true, message: "Subscribed successfully!" });
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(500).json({ error: "Failed to process subscription" });
    }
  });

  app.get("/.netlify/functions/news", async (req, res) => {
    try {
      // Use GNEWS_API_KEY from environment
      const apiKey = process.env.GNEWS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GNEWS_API_KEY is not configured" });
      }

      const url = `https://gnews.io/api/v4/search?q="artificial+intelligence"+OR+"machine+learning"+OR+"internship"+OR+"fresher"+OR+"hiring"&lang=en&apikey=${apiKey}&max=20`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.articles) {
        return res.json([]);
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

      res.json(processedNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
