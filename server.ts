import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/news", async (req, res) => {
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
