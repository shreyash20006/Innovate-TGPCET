import { Handler } from '@netlify/functions';

const JOBS: Record<string, any> = {};

function createJob(type: string, title: string): string {
  const id = Math.random().toString(36).slice(2, 10);
  JOBS[id] = {
    job_id: id,
    status: 'completed',
    type,
    title,
    progress: 100,
    created_at: new Date().toISOString(),
    result: buildDemoResult(type, title),
    error: null,
  };
  return id;
}

function buildDemoResult(type: string, title: string): any {
  const base = {
    notebook_title: title,
    demo: true,
    message: 'Demo mode — install notebooklm-py and run notebooklm login for real generation.',
  };

  if (type === 'podcast' || type === 'audio') {
    return { ...base, style: 'deep-dive', audio_file: null, sources_added: 1 };
  }

  if (type === 'study_kit') {
    return {
      ...base,
      sources_added: 1,
      quiz: [
        { question: 'What is machine learning?', answerOptions: [{ text: 'A type of AI', isCorrect: true }, { text: 'A programming language', isCorrect: false }] },
        { question: 'What is deep learning?', answerOptions: [{ text: 'Simple regression', isCorrect: false }, { text: 'Neural networks with many layers', isCorrect: true }] },
      ],
      flashcards: [
        { front: 'What is AI?', back: 'Artificial Intelligence — machines simulating human intelligence.' },
        { front: 'What is NLP?', back: 'Natural Language Processing — computers understanding human language.' },
      ],
      study_guide: `# Study Guide\n\nThis is a demo study guide.\n\n## Key Concepts\n- Machine Learning\n- Deep Learning\n- Natural Language Processing\n\n## Practice Questions\n1. Explain supervised vs unsupervised learning.\n2. What are neural network components?`,
    };
  }

  if (type === 'research') {
    return {
      ...base,
      query: title,
      sources_found: 5,
      report: `# Research Report: ${title}\n\nThis is a demo report.\n\n## Executive Summary\nAnalysis of "${title}".\n\n## Key Findings\n1. Key insight one\n2. Key insight two\n3. Key insight three\n\n## Conclusion\nFurther investigation recommended.`,
      mind_map: {
        name: title,
        children: [
          { name: 'Subtopic A', children: [{ name: 'Detail 1' }, { name: 'Detail 2' }] },
          { name: 'Subtopic B', children: [{ name: 'Detail 3' }] },
        ],
      },
    };
  }

  return { ...base, artifact_type: type, sources_added: 1, file_path: null };
}

export const handler: Handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/nlm', '') || '/';

  try {
    if (path === '/api/nlm/health' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: 'ok', notebooklm_available: false, message: 'Running in demo mode on Netlify.' }),
      };
    }

    if (path === '/api/nlm/upload' && event.httpMethod === 'POST') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ file_id: 'demo-file-' + Date.now(), filename: 'uploaded-file', size: 0, type: '.pdf' }),
      };
    }

    if (path === '/api/nlm/podcast' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const id = createJob('podcast', body.title || 'Podcast');
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ job_id: id, status: 'pending' }) };
    }

    if (path === '/api/nlm/study-kit' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const id = createJob('study_kit', body.title || 'Study Kit');
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ job_id: id, status: 'pending' }) };
    }

    if (path === '/api/nlm/research' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const id = createJob('research', body.title || body.query || 'Research');
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ job_id: id, status: 'pending' }) };
    }

    if (path === '/api/nlm/studio' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const type = body.artifact_type || 'report';
      const id = createJob(type, body.title || 'Studio Generate');
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ status: 'accepted', job_id: id }) };
    }

    if (path.startsWith('/api/nlm/jobs/') && event.httpMethod === 'GET') {
      const jobId = path.replace('/api/nlm/jobs/', '');
      const job = JOBS[jobId];
      if (!job) return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Job not found' }) };
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(job) };
    }

    if (path === '/api/nlm/jobs' && event.httpMethod === 'GET') {
      const list = Object.values(JOBS).sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(list) };
    }

    return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err: any) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message || 'Internal server error' }) };
  }
};
