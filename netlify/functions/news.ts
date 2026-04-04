import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "GNEWS_API_KEY is not configured in Netlify Environment Variables" }) 
      };
    }

    const url = `https://gnews.io/api/v4/search?q="artificial+intelligence"+OR+"machine+learning"+OR+"internship"+OR+"fresher"+OR+"hiring"&lang=en&apikey=${apiKey}&max=20`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles) {
      return { statusCode: 200, body: JSON.stringify([]) };
    }

    const aiKeywords = ["ai", "artificial intelligence", "machine learning", "generative ai"];
    const jobsKeywords = ["job", "hiring", "recruitment", "fresher", "placement"];
    const internshipKeywords = ["internship", "intern"];

    const processedNews = data.articles
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

        const cleanTitle = title.length > 80 ? title.substring(0, 77) + "..." : title;
        const hook = title.split(" ").slice(0, 8).join(" ") + "...";
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

    const customPost = {
      id: 9999,
      hook: "Claude is just shippingggggg...",
      title: "Claude Dispatch: Control your desktop from your phone",
      summary: "I gave dispatch this to do from my phone:\n\n\"go to X, find 5-10 high performing posts from last 24 hours, write a full script for each, put everything in a PDF in my downloads.\"\n\nCame back to 7 posts, 7 scripts, 7 virality scorecards. laptop untouched. and all gtg ✅\n\nHow to set it up:\n1. download claude desktop app\n2. open cowork → dispatch in sidebar\n3. scan QR with claude on your phone\n4. turn on computer use in settings\n\nText it tasks from your phone while you're away from your desk. Combine it with /schedule and it runs every morning before you even sit down.\n\nwhat would you hand off first? 👀",
      category: "AI",
      url: "https://anthropic.com/claude",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      isNew: true,
      imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop"
    };

    processedNews.unshift(customPost);

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Helpful if you ever fetch this from a different domain
      },
      body: JSON.stringify(processedNews)
    };
  } catch (error) {
    console.error("Error fetching news:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch news" })
    };
  }
};
