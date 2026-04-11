"""
NotebookLM Integration Backend — FastAPI server
Provides endpoints for:
  1. Podcast / Audio Overview generation
  2. Study Kit (quiz, flashcards, study guide) generation
  3. Automated Research Assistant
"""

import asyncio
import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# NotebookLM client import — graceful fallback for environments without it
# ---------------------------------------------------------------------------
try:
    from notebooklm import NotebookLMClient
    HAS_NOTEBOOKLM = True
except ImportError:
    HAS_NOTEBOOKLM = False

app = FastAPI(title="NotebookLM Integration API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory job store (swap for Redis/DB in production)
# ---------------------------------------------------------------------------
JOBS: dict = {}  # job_id -> { status, type, result, error, created_at, ... }
DOWNLOADS_DIR = Path(__file__).parent / "downloads"
DOWNLOADS_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class PodcastRequest(BaseModel):
    sources: list[str]              # URLs, YouTube links, or text snippets
    title: str = "My Podcast"
    style: str = "deep-dive"        # deep-dive | brief | critique | debate
    language: str = "English"

class StudyKitRequest(BaseModel):
    sources: list[str]
    title: str = "Study Kit"
    quiz_count: int = 10
    flashcard_count: int = 15
    difficulty: str = "medium"      # easy | medium | hard

class ResearchRequest(BaseModel):
    query: str
    title: str = "Research"
    mode: str = "deep"              # fast | deep
    auto_import: bool = True

class JobStatus(BaseModel):
    job_id: str
    status: str    # pending | running | completed | failed
    type: str
    progress: int  # 0-100
    result: Optional[dict] = None
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _create_job(job_type: str, title: str) -> str:
    job_id = str(uuid.uuid4())[:8]
    JOBS[job_id] = {
        "status": "pending",
        "type": job_type,
        "title": title,
        "progress": 0,
        "result": None,
        "error": None,
        "created_at": datetime.now().isoformat(),
    }
    return job_id


def _update_job(job_id: str, **kwargs):
    if job_id in JOBS:
        JOBS[job_id].update(kwargs)


# ---------------------------------------------------------------------------
# Background tasks — real NotebookLM integration
# ---------------------------------------------------------------------------
async def _run_podcast_pipeline(job_id: str, req: PodcastRequest):
    """Full automated pipeline: create notebook → add sources → generate audio → download."""
    try:
        _update_job(job_id, status="running", progress=10)

        if not HAS_NOTEBOOKLM:
            # Demo mode — simulate the pipeline
            await asyncio.sleep(2)
            _update_job(job_id, progress=30)
            await asyncio.sleep(2)
            _update_job(job_id, progress=60)
            await asyncio.sleep(2)
            _update_job(job_id, progress=90)
            
            result = {
                "notebook_title": req.title,
                "sources_added": len(req.sources),
                "style": req.style,
                "language": req.language,
                "audio_file": None,
                "message": "Demo mode — install notebooklm-py and authenticate to enable real generation.",
                "demo": True,
            }
            _update_job(job_id, status="completed", progress=100, result=result)
            return

        async with await NotebookLMClient.from_storage() as client:
            # 1. Create notebook
            _update_job(job_id, progress=15)
            nb = await client.notebooks.create(req.title)
            
            # 2. Add sources
            _update_job(job_id, progress=25)
            for i, source in enumerate(req.sources):
                source_stripped = source.strip()
                if source_stripped.startswith("http"):
                    await client.sources.add_url(nb.id, source_stripped, wait=True)
                else:
                    await client.sources.add_text(nb.id, source_stripped, title=f"Source {i+1}")
                progress = 25 + int((i + 1) / len(req.sources) * 30)
                _update_job(job_id, progress=progress)

            # 3. Generate audio
            _update_job(job_id, progress=60)
            audio_status = await client.artifacts.generate_audio(
                nb.id,
                instructions=f"Style: {req.style}. Language: {req.language}. Make it engaging and informative.",
            )
            await client.artifacts.wait_for_completion(nb.id, audio_status.task_id)
            _update_job(job_id, progress=85)

            # 4. Download
            filename = f"podcast_{job_id}.mp3"
            filepath = DOWNLOADS_DIR / filename
            await client.artifacts.download_audio(nb.id, str(filepath))
            _update_job(job_id, progress=95)

            result = {
                "notebook_title": req.title,
                "sources_added": len(req.sources),
                "style": req.style,
                "language": req.language,
                "audio_file": filename,
                "demo": False,
            }
            _update_job(job_id, status="completed", progress=100, result=result)

    except Exception as e:
        _update_job(job_id, status="failed", error=str(e))


async def _run_study_kit_pipeline(job_id: str, req: StudyKitRequest):
    """Full automated pipeline: create notebook → add sources → generate quiz + flashcards + study guide → download all."""
    try:
        _update_job(job_id, status="running", progress=10)

        if not HAS_NOTEBOOKLM:
            # Demo mode
            await asyncio.sleep(1)
            _update_job(job_id, progress=25)
            await asyncio.sleep(1)
            _update_job(job_id, progress=50)
            await asyncio.sleep(1)
            _update_job(job_id, progress=75)
            await asyncio.sleep(1)

            demo_quiz = [
                {"question": "What is machine learning?", "options": ["A", "B", "C", "D"], "answer": "A"},
                {"question": "What is deep learning?", "options": ["A", "B", "C", "D"], "answer": "B"},
            ]
            demo_flashcards = [
                {"front": "What is AI?", "back": "Artificial Intelligence is the simulation of human intelligence by machines."},
                {"front": "What is NLP?", "back": "Natural Language Processing enables computers to understand human language."},
            ]
            result = {
                "notebook_title": req.title,
                "sources_added": len(req.sources),
                "quiz": demo_quiz,
                "flashcards": demo_flashcards,
                "study_guide": "# Study Guide\n\nThis is a demo study guide. Install notebooklm-py and authenticate for real content.\n\n## Key Concepts\n- Machine Learning\n- Deep Learning\n- Natural Language Processing",
                "quiz_file": None,
                "flashcards_file": None,
                "study_guide_file": None,
                "demo": True,
            }
            _update_job(job_id, status="completed", progress=100, result=result)
            return

        async with await NotebookLMClient.from_storage() as client:
            # 1. Create notebook
            nb = await client.notebooks.create(req.title)
            _update_job(job_id, progress=15)

            # 2. Add sources
            for i, source in enumerate(req.sources):
                source_stripped = source.strip()
                if source_stripped.startswith("http"):
                    await client.sources.add_url(nb.id, source_stripped, wait=True)
                else:
                    await client.sources.add_text(nb.id, source_stripped, title=f"Source {i+1}")
                _update_job(job_id, progress=15 + int((i + 1) / len(req.sources) * 20))

            # 3. Generate quiz
            _update_job(job_id, progress=40)
            await client.artifacts.generate_quiz(nb.id, quantity=req.quiz_count, difficulty=req.difficulty)
            quiz_file = f"quiz_{job_id}.json"
            await client.artifacts.download_quiz(nb.id, str(DOWNLOADS_DIR / quiz_file), output_format="json")

            # 4. Generate flashcards
            _update_job(job_id, progress=60)
            await client.artifacts.generate_flashcards(nb.id, quantity=req.flashcard_count, difficulty=req.difficulty)
            fc_file = f"flashcards_{job_id}.json"
            await client.artifacts.download_flashcards(nb.id, str(DOWNLOADS_DIR / fc_file), output_format="json")

            # 5. Generate study guide
            _update_job(job_id, progress=80)
            await client.artifacts.generate_report(nb.id, report_type="study_guide")
            sg_file = f"study_guide_{job_id}.md"
            await client.artifacts.download_report(nb.id, str(DOWNLOADS_DIR / sg_file))

            # Load JSON content
            quiz_data = json.loads((DOWNLOADS_DIR / quiz_file).read_text())
            fc_data = json.loads((DOWNLOADS_DIR / fc_file).read_text())
            sg_content = (DOWNLOADS_DIR / sg_file).read_text()

            result = {
                "notebook_title": req.title,
                "sources_added": len(req.sources),
                "quiz": quiz_data,
                "flashcards": fc_data,
                "study_guide": sg_content,
                "quiz_file": quiz_file,
                "flashcards_file": fc_file,
                "study_guide_file": sg_file,
                "demo": False,
            }
            _update_job(job_id, status="completed", progress=100, result=result)

    except Exception as e:
        _update_job(job_id, status="failed", error=str(e))


async def _run_research_pipeline(job_id: str, req: ResearchRequest):
    """Full automated pipeline: create notebook → run research query → generate report + mind map → download."""
    try:
        _update_job(job_id, status="running", progress=10)

        if not HAS_NOTEBOOKLM:
            # Demo mode
            await asyncio.sleep(1)
            _update_job(job_id, progress=30)
            await asyncio.sleep(2)
            _update_job(job_id, progress=60)
            await asyncio.sleep(1)
            _update_job(job_id, progress=90)

            result = {
                "notebook_title": req.title,
                "query": req.query,
                "report": f"# Research Report: {req.query}\n\nThis is a demo research report. Install notebooklm-py and authenticate for real results.\n\n## Executive Summary\nThe research query '{req.query}' was analyzed across multiple sources.\n\n## Key Findings\n1. Finding one — placeholder\n2. Finding two — placeholder\n3. Finding three — placeholder\n\n## Conclusion\nFurther investigation is recommended.",
                "mind_map": {
                    "root": req.query,
                    "children": [
                        {"label": "Subtopic A", "children": [{"label": "Detail 1"}, {"label": "Detail 2"}]},
                        {"label": "Subtopic B", "children": [{"label": "Detail 3"}, {"label": "Detail 4"}]},
                        {"label": "Subtopic C", "children": [{"label": "Detail 5"}]},
                    ],
                },
                "sources_found": 5,
                "report_file": None,
                "mind_map_file": None,
                "demo": True,
            }
            _update_job(job_id, status="completed", progress=100, result=result)
            return

        async with await NotebookLMClient.from_storage() as client:
            # 1. Create notebook
            nb = await client.notebooks.create(req.title)
            _update_job(job_id, progress=15)

            # 2. Run research and auto-import
            _update_job(job_id, progress=25)
            await client.sources.add_research(nb.id, req.query)
            _update_job(job_id, progress=50)

            # 3. Generate report
            _update_job(job_id, progress=60)
            await client.artifacts.generate_report(nb.id, report_type="briefing_doc")
            report_file = f"report_{job_id}.md"
            await client.artifacts.download_report(nb.id, str(DOWNLOADS_DIR / report_file))

            # 4. Generate mind map
            _update_job(job_id, progress=80)
            await client.artifacts.generate_mind_map(nb.id)
            mm_file = f"mindmap_{job_id}.json"
            await client.artifacts.download_mind_map(nb.id, str(DOWNLOADS_DIR / mm_file))

            report_content = (DOWNLOADS_DIR / report_file).read_text()
            mm_data = json.loads((DOWNLOADS_DIR / mm_file).read_text())

            result = {
                "notebook_title": req.title,
                "query": req.query,
                "report": report_content,
                "mind_map": mm_data,
                "sources_found": len(mm_data.get("children", [])),
                "report_file": report_file,
                "mind_map_file": mm_file,
                "demo": False,
            }
            _update_job(job_id, status="completed", progress=100, result=result)

    except Exception as e:
        _update_job(job_id, status="failed", error=str(e))


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/nlm/health")
async def health():
    return {
        "status": "ok",
        "notebooklm_available": HAS_NOTEBOOKLM,
        "message": "NotebookLM backend is running" if HAS_NOTEBOOKLM else "Running in demo mode — pip install notebooklm-py[browser]",
    }


@app.post("/api/nlm/podcast")
async def generate_podcast(req: PodcastRequest, bg: BackgroundTasks):
    if not req.sources:
        raise HTTPException(400, "At least one source URL or text is required")
    job_id = _create_job("podcast", req.title)
    bg.add_task(_run_podcast_pipeline, job_id, req)
    return {"job_id": job_id, "status": "pending"}


@app.post("/api/nlm/study-kit")
async def generate_study_kit(req: StudyKitRequest, bg: BackgroundTasks):
    if not req.sources:
        raise HTTPException(400, "At least one source URL or text is required")
    job_id = _create_job("study_kit", req.title)
    bg.add_task(_run_study_kit_pipeline, job_id, req)
    return {"job_id": job_id, "status": "pending"}


@app.post("/api/nlm/research")
async def run_research(req: ResearchRequest, bg: BackgroundTasks):
    if not req.query.strip():
        raise HTTPException(400, "Research query is required")
    job_id = _create_job("research", req.title)
    bg.add_task(_run_research_pipeline, job_id, req)
    return {"job_id": job_id, "status": "pending"}


@app.get("/api/nlm/jobs/{job_id}")
async def get_job(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(404, "Job not found")
    job = JOBS[job_id]
    return {
        "job_id": job_id,
        **job,
    }


@app.get("/api/nlm/jobs")
async def list_jobs():
    return [{"job_id": k, **v} for k, v in sorted(JOBS.items(), key=lambda x: x[1]["created_at"], reverse=True)]


@app.get("/api/nlm/download/{filename}")
async def download_file(filename: str):
    filepath = DOWNLOADS_DIR / filename
    if not filepath.exists():
        raise HTTPException(404, "File not found")
    return FileResponse(str(filepath), filename=filename)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
