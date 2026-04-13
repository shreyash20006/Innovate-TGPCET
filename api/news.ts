import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GNEWS_API_KEY is not configured in Vercel Environment Variables' });
    }

    const url = `https://gnews.io/api/v4/search?q="artificial+intelligence"+OR+"machine+learning"+OR+"internship"+OR+"fresher"+OR+"hiring"&lang=en&apikey=${apiKey}&max=20`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (!data.articles) return res.status(200).json([]);

    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'generative ai'];
    const jobsKeywords = ['job', 'hiring', 'recruitment', 'fresher', 'placement'];
    const internshipKeywords = ['internship', 'intern'];

    const processedNews = data.articles
      .map((article: any, index: number) => {
        const title = article.title || '';
        const desc = article.description || '';
        const content = `${title} ${desc}`.toLowerCase();

        let category = '';
        if (aiKeywords.some((kw) => content.includes(kw))) category = 'AI';
        else if (internshipKeywords.some((kw) => content.includes(kw))) category = 'Internship';
        else if (jobsKeywords.some((kw) => content.includes(kw))) category = 'Jobs';
        else if (content.includes('placement')) category = 'Hiring';

        if (!category) return null;

        const cleanTitle = title.length > 80 ? title.substring(0, 77) + '...' : title;
        const hook = title.split(' ').slice(0, 8).join(' ') + '...';
        const summary = desc.length > 150 ? desc.substring(0, 147) + '...' : desc;

        return {
          id: index + 1,
          hook,
          title: cleanTitle,
          summary,
          category,
          url: article.url,
          date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          isNew: true,
        };
      })
      .filter(Boolean);

    // Pinned custom post
    const customPost = {
      id: 9999,
      hook: 'Claude is just shippingggggg...',
      title: 'Claude Dispatch: Control your desktop from your phone',
      summary: 'I gave dispatch this to do from my phone: "go to X, find 5-10 high performing posts from last 24 hours, write a full script for each, put everything in a PDF in my downloads." Came back to 7 posts, 7 scripts, 7 virality scorecards.',
      category: 'AI',
      url: 'https://anthropic.com/claude',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isNew: true,
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
    };

    processedNews.unshift(customPost);
    return res.status(200).json(processedNews);
  } catch (error) {
    console.error('Error fetching news:', error);
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
}
