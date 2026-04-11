"""
NotebookLM Integration Backend — FastAPI server
Uses the real notebooklm-py API (https://github.com/teng-lin/notebooklm-py)

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

# Import enums only when available
if HAS_NOTEBOOKLM:
    try:
        from notebooklm.rpc import (
            AudioFormat, AudioLength,
            ReportFormat,
            QuizQuantity, QuizDifficulty,
        )
    except ImportError:
        # Fallback — enums may live elsewhere in some versions
        AudioFormat = AudioLength = ReportFormat = QuizQuantity = QuizDifficulty = None

app = FastAPI(title="NotebookLM Integration API", version="2.0.0")

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
    language: str = "en"

class StudyKitRequest(BaseModel):
    sources: list[str]
    title: str = "Study Kit"
    difficulty: str = "medium"      # easy | medium | hard
    language: str = "en"

class ResearchRequest(BaseModel):
    query: str
    title: str = "Research"
    mode: str = "deep"              # fast | deep
    source: str = "web"             # web | drive
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


def _map_audio_format(style: str):
    """Map user-friendly style names to notebooklm-py AudioFormat enum."""
    if AudioFormat is None:
        return None
    mapping = {
        "deep-dive": AudioFormat.DEEP_DIVE,
        "brief": AudioFormat.BRIEF,
        "critique": AudioFormat.CRITIQUE,
        "debate": AudioFormat.DEBATE,
    }
    return mapping.get(style.lower())


def _map_quiz_difficulty(difficulty: str):
    """Map difficulty string to QuizDifficulty enum."""
    if QuizDifficulty is None:
        return None
    mapping = {
        "easy": QuizDifficulty.EASY,
        "medium": QuizDifficulty.MEDIUM,
        "hard": QuizDifficulty.HARD,
    }
    return mapping.get(difficulty.lower())


# ---------------------------------------------------------------------------
# Source adding helper
# ---------------------------------------------------------------------------
async def _add_sources_to_notebook(client, notebook_id: str, sources: list[str], job_id: str, base_progress: int = 15, progress_range: int = 30):
    """Add a list of sources (URLs or text) to a notebook, updating job progress."""
    added_ids = []
    for i, source in enumerate(sources):
        source_stripped = source.strip()
        if not source_stripped:
            continue
        if source_stripped.startswith("http"):
            src = await client.sources.add_url(notebook_id, source_stripped, wait=True)
        else:
            src = await client.sources.add_text(
                notebook_id,
                f"Source {i + 1}",    # title
                source_stripped,       # content
                wait=True,
            )
        added_ids.append(src.id)
        progress = base_progress + int((i + 1) / len(sources) * progress_range)
        _update_job(job_id, progress=progress)
    return added_ids


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

        # Real notebooklm-py pipeline
        async with await NotebookLMClient.from_storage() as client:
            # 1. Create notebook
            _update_job(job_id, progress=15)
            nb = await client.notebooks.create(req.title)

            # 2. Add sources (URLs, YouTube, or pasted text)
            source_ids = await _add_sources_to_notebook(
                client, nb.id, req.sources, job_id,
                base_progress=15, progress_range=30
            )

            # 3. Generate Audio Overview
            _update_job(job_id, progress=55)
            audio_format = _map_audio_format(req.style)

            gen_kwargs = {
                "notebook_id": nb.id,
                "source_ids": source_ids if source_ids else None,
                "language": req.language,
            }
            if audio_format:
                gen_kwargs["audio_format"] = audio_format

            audio_status = await client.artifacts.generate_audio(**gen_kwargs)

            # 4. Wait for completion
            _update_job(job_id, progress=65)
            await client.artifacts.wait_for_completion(nb.id, audio_status.task_id)
            _update_job(job_id, progress=85)

            # 5. Download audio file
            filename = f"podcast_{job_id}.mp4"
            filepath = DOWNLOADS_DIR / filename
            await client.artifacts.download_audio(nb.id, str(filepath))
            _update_job(job_id, progress=95)

            result = {
                "notebook_id": nb.id,
                "notebook_title": req.title,
                "sources_added": len(source_ids),
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

        # Real notebooklm-py pipeline
        async with await NotebookLMClient.from_storage() as client:
            # 1. Create notebook
            nb = await client.notebooks.create(req.title)
            _update_job(job_id, progress=15)

            # 2. Add sources
            source_ids = await _add_sources_to_notebook(
                client, nb.id, req.sources, job_id,
                base_progress=15, progress_range=20
            )

            difficulty = _map_quiz_difficulty(req.difficulty)

            # 3. Generate Quiz
            _update_job(job_id, progress=40)
            quiz_gen_kwargs = {"notebook_id": nb.id, "source_ids": source_ids or None}
            if difficulty:
                quiz_gen_kwargs["difficulty"] = difficulty
            quiz_status = await client.artifacts.generate_quiz(**quiz_gen_kwargs)
            await client.artifacts.wait_for_completion(nb.id, quiz_status.task_id)

            quiz_file = f"quiz_{job_id}.json"
            await client.artifacts.download_quiz(
                nb.id, str(DOWNLOADS_DIR / quiz_file), output_format="json"
            )

            # 4. Generate Flashcards
            _update_job(job_id, progress=60)
            fc_gen_kwargs = {"notebook_id": nb.id, "source_ids": source_ids or None}
            if difficulty:
                fc_gen_kwargs["difficulty"] = difficulty
            fc_status = await client.artifacts.generate_flashcards(**fc_gen_kwargs)
            await client.artifacts.wait_for_completion(nb.id, fc_status.task_id)

            fc_file = f"flashcards_{job_id}.json"
            await client.artifacts.download_flashcards(
                nb.id, str(DOWNLOADS_DIR / fc_file), output_format="json"
            )

            # 5. Generate Study Guide (uses ReportFormat.STUDY_GUIDE)
            _update_job(job_id, progress=80)
            sg_status = await client.artifacts.generate_study_guide(
                nb.id,
                source_ids=source_ids or None,
                language=req.language,
            )
            await client.artifacts.wait_for_completion(nb.id, sg_status.task_id)

            sg_file = f"study_guide_{job_id}.md"
            await client.artifacts.download_report(
                nb.id, str(DOWNLOADS_DIR / sg_file)
            )

            # Load JSON content for API response
            quiz_data = json.loads((DOWNLOADS_DIR / quiz_file).read_text())
            fc_data = json.loads((DOWNLOADS_DIR / fc_file).read_text())
            sg_content = (DOWNLOADS_DIR / sg_file).read_text()

            result = {
                "notebook_id": nb.id,
                "notebook_title": req.title,
                "sources_added": len(source_ids),
                "quiz": quiz_data.get("questions", quiz_data),
                "flashcards": fc_data.get("cards", fc_data),
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
    """Full automated pipeline: create notebook → run research → import sources → generate report + mind map."""
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
                    "name": req.query,
                    "children": [
                        {"name": "Subtopic A", "children": [{"name": "Detail 1"}, {"name": "Detail 2"}]},
                        {"name": "Subtopic B", "children": [{"name": "Detail 3"}, {"name": "Detail 4"}]},
                        {"name": "Subtopic C", "children": [{"name": "Detail 5"}]},
                    ],
                },
                "sources_found": 5,
                "report_file": None,
                "mind_map_file": None,
                "demo": True,
            }
            _update_job(job_id, status="completed", progress=100, result=result)
            return

        # Real notebooklm-py pipeline
        async with await NotebookLMClient.from_storage() as client:
            # 1. Create notebook
            nb = await client.notebooks.create(req.title)
            _update_job(job_id, progress=15)

            # 2. Start research (web or drive, fast or deep)
            _update_job(job_id, progress=20)
            research_result = await client.research.start(
                nb.id,
                query=req.query,
                source=req.source,       # "web" or "drive"
                mode=req.mode,           # "fast" or "deep"
            )

            if not research_result:
                raise Exception("Research task failed to start")

            task_id = research_result["task_id"]

            # 3. Poll for research completion
            _update_job(job_id, progress=30)
            max_polls = 60  # max ~5 minutes
            for poll_i in range(max_polls):
                poll_result = await client.research.poll(nb.id)
                if poll_result.get("status") == "completed":
                    break
                await asyncio.sleep(5)
                progress = 30 + int((poll_i / max_polls) * 20)
                _update_job(job_id, progress=min(progress, 49))
            else:
                raise Exception("Research timed out after 5 minutes")

            # 4. Auto-import discovered sources
            _update_job(job_id, progress=50)
            discovered_sources = poll_result.get("sources", [])
            sources_imported = 0
            if req.auto_import and discovered_sources:
                imported = await client.research.import_sources(
                    nb.id, task_id, discovered_sources
                )
                sources_imported = len(imported)
                # Wait for imported sources to be processed
                await asyncio.sleep(5)

            # 5. Generate briefing report
            _update_job(job_id, progress=60)
            if ReportFormat:
                report_status = await client.artifacts.generate_report(
                    nb.id, report_format=ReportFormat.BRIEFING_DOC
                )
            else:
                report_status = await client.artifacts.generate_report(nb.id)
            await client.artifacts.wait_for_completion(nb.id, report_status.task_id)

            report_file = f"report_{job_id}.md"
            await client.artifacts.download_report(
                nb.id, str(DOWNLOADS_DIR / report_file)
            )
            _update_job(job_id, progress=75)

            # 6. Generate mind map
            _update_job(job_id, progress=80)
            mm_result = await client.artifacts.generate_mind_map(nb.id)
            mm_data = mm_result.get("mind_map", {})

            mm_file = f"mindmap_{job_id}.json"
            (DOWNLOADS_DIR / mm_file).write_text(
                json.dumps(mm_data, indent=2, ensure_ascii=False),
                encoding="utf-8"
            )
            _update_job(job_id, progress=95)

            report_content = (DOWNLOADS_DIR / report_file).read_text()

            # Include research report from deep mode if available
            research_report = poll_result.get("report", "")

            result = {
                "notebook_id": nb.id,
                "notebook_title": req.title,
                "query": req.query,
                "mode": req.mode,
                "report": report_content,
                "research_report": research_report,
                "mind_map": mm_data,
                "sources_found": len(discovered_sources),
                "sources_imported": sources_imported,
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
    return [{
        "job_id": k, **v
    } for k, v in sorted(
        JOBS.items(),
        key=lambda x: x[1]["created_at"],
        reverse=True
    )]


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
