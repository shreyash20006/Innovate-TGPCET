"""
NotebookLM Integration Backend — FastAPI server
Uses the real notebooklm-py API (https://github.com/teng-lin/notebooklm-py)

Provides endpoints for:
  1. Podcast / Audio Overview generation
  2. Study Kit (quiz, flashcards, study guide) generation
  3. Automated Research Assistant
  4. PDF / file upload support
"""

import asyncio
import json
import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
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
# Directories
# ---------------------------------------------------------------------------
JOBS: dict = {}
DOWNLOADS_DIR = Path(__file__).parent / "downloads"
UPLOADS_DIR = Path(__file__).parent / "uploads"
DOWNLOADS_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class PodcastRequest(BaseModel):
    sources: list[str]              # URLs, YouTube links, text, or uploaded file IDs
    files: list[str] = []           # uploaded file IDs from /api/nlm/upload
    title: str = "My Podcast"
    style: str = "deep-dive"
    language: str = "en"

class StudyKitRequest(BaseModel):
    sources: list[str]
    files: list[str] = []
    title: str = "Study Kit"
    difficulty: str = "medium"
    language: str = "en"

class ResearchRequest(BaseModel):
    query: str
    title: str = "Research"
    mode: str = "deep"
    source: str = "web"
    auto_import: bool = True

class StudioRequest(BaseModel):
    sources: list[str]
    files: list[str] = []
    title: str = "Studio Generate"
    artifact_type: str
    language: str = "en"


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
    if QuizDifficulty is None:
        return None
    mapping = {
        "easy": QuizDifficulty.EASY,
        "medium": QuizDifficulty.MEDIUM,
        "hard": QuizDifficulty.HARD,
    }
    return mapping.get(difficulty.lower())


# ---------------------------------------------------------------------------
# Source adding helper — handles URLs, text, AND uploaded files
# ---------------------------------------------------------------------------
async def _add_sources_to_notebook(
    client, notebook_id: str,
    sources: list[str], file_ids: list[str],
    job_id: str, base_progress: int = 15, progress_range: int = 30
):
    """Add URLs, text snippets, and uploaded files to a notebook."""
    added_ids = []
    total_items = len(sources) + len(file_ids)
    if total_items == 0:
        return added_ids

    item_idx = 0

    # Add URL/text sources
    for source in sources:
        source_stripped = source.strip()
        if not source_stripped:
            continue
        if source_stripped.startswith("http"):
            src = await client.sources.add_url(notebook_id, source_stripped, wait=True)
        else:
            src = await client.sources.add_text(
                notebook_id, f"Source {item_idx + 1}", source_stripped, wait=True
            )
        added_ids.append(src.id)
        item_idx += 1
        progress = base_progress + int(item_idx / total_items * progress_range)
        _update_job(job_id, progress=progress)

    # Add uploaded files (PDFs, docs, etc.)
    for file_id in file_ids:
        file_path = UPLOADS_DIR / file_id
        if file_path.exists():
            src = await client.sources.add_file(notebook_id, file_path, wait=True)
            added_ids.append(src.id)
        item_idx += 1
        progress = base_progress + int(item_idx / total_items * progress_range)
        _update_job(job_id, progress=progress)

    return added_ids


# ---------------------------------------------------------------------------
# Background tasks
# ---------------------------------------------------------------------------
async def _run_podcast_pipeline(job_id: str, req: PodcastRequest):
    try:
        _update_job(job_id, status="running", progress=10)

        if not HAS_NOTEBOOKLM:
            await asyncio.sleep(2); _update_job(job_id, progress=30)
            await asyncio.sleep(2); _update_job(job_id, progress=60)
            await asyncio.sleep(2); _update_job(job_id, progress=90)
            result = {
                "notebook_title": req.title,
                "sources_added": len(req.sources) + len(req.files),
                "files_added": len(req.files),
                "style": req.style,
                "language": req.language,
                "audio_file": None,
                "message": "Demo mode — install notebooklm-py and run 'notebooklm login' for real generation.",
                "demo": True,
            }
            _update_job(job_id, status="completed", progress=100, result=result)
            return

        async with await NotebookLMClient.from_storage() as client:
            _update_job(job_id, progress=15)
            nb = await client.notebooks.create(req.title)

            source_ids = await _add_sources_to_notebook(
                client, nb.id, req.sources, req.files, job_id, 15, 30
            )

            _update_job(job_id, progress=55)
            audio_format = _map_audio_format(req.style)
            gen_kwargs = {"notebook_id": nb.id, "language": req.language}
            if source_ids:
                gen_kwargs["source_ids"] = source_ids
            if audio_format:
                gen_kwargs["audio_format"] = audio_format

            audio_status = await client.artifacts.generate_audio(**gen_kwargs)
            _update_job(job_id, progress=65)
            await client.artifacts.wait_for_completion(nb.id, audio_status.task_id)
            _update_job(job_id, progress=85)

            filename = f"podcast_{job_id}.mp4"
            await client.artifacts.download_audio(nb.id, str(DOWNLOADS_DIR / filename))

            result = {
                "notebook_id": nb.id,
                "notebook_title": req.title,
                "sources_added": len(source_ids),
                "style": req.style,
                "audio_file": filename,
                "demo": False,
            }
            _update_job(job_id, status="completed", progress=100, result=result)

    except Exception as e:
        _update_job(job_id, status="failed", error=str(e))


async def _run_study_kit_pipeline(job_id: str, req: StudyKitRequest):
    try:
        _update_job(job_id, status="running", progress=10)

        if not HAS_NOTEBOOKLM:
            await asyncio.sleep(1); _update_job(job_id, progress=25)
            await asyncio.sleep(1); _update_job(job_id, progress=50)
            await asyncio.sleep(1); _update_job(job_id, progress=75)
            await asyncio.sleep(1)
            result = {
                "notebook_title": req.title,
                "sources_added": len(req.sources) + len(req.files),
                "quiz": [
                    {"question": "What is machine learning?", "answerOptions": [{"text": "A type of AI", "isCorrect": True}, {"text": "A programming language", "isCorrect": False}]},
                    {"question": "What is deep learning?", "answerOptions": [{"text": "Simple regression", "isCorrect": False}, {"text": "Neural networks with many layers", "isCorrect": True}]},
                ],
                "flashcards": [
                    {"front": "What is AI?", "back": "Artificial Intelligence — machines simulating human intelligence."},
                    {"front": "What is NLP?", "back": "Natural Language Processing — computers understanding human language."},
                    {"front": "What is CNN?", "back": "Convolutional Neural Network — used mainly for image recognition tasks."},
                ],
                "study_guide": "# Study Guide\n\nThis is a demo study guide. Install `notebooklm-py` and run `notebooklm login` for real content.\n\n## Key Concepts\n- Machine Learning\n- Deep Learning\n- Natural Language Processing\n\n## Practice Questions\n1. Explain the difference between supervised and unsupervised learning.\n2. What are the key components of a neural network?",
                "demo": True,
            }
            _update_job(job_id, status="completed", progress=100, result=result)
            return

        async with await NotebookLMClient.from_storage() as client:
            nb = await client.notebooks.create(req.title)
            _update_job(job_id, progress=15)

            source_ids = await _add_sources_to_notebook(
                client, nb.id, req.sources, req.files, job_id, 15, 20
            )

            difficulty = _map_quiz_difficulty(req.difficulty)

            _update_job(job_id, progress=40)
            quiz_kwargs = {"notebook_id": nb.id}
            if source_ids: quiz_kwargs["source_ids"] = source_ids
            if difficulty: quiz_kwargs["difficulty"] = difficulty
            quiz_status = await client.artifacts.generate_quiz(**quiz_kwargs)
            await client.artifacts.wait_for_completion(nb.id, quiz_status.task_id)
            quiz_file = f"quiz_{job_id}.json"
            await client.artifacts.download_quiz(nb.id, str(DOWNLOADS_DIR / quiz_file), output_format="json")

            _update_job(job_id, progress=60)
            fc_kwargs = {"notebook_id": nb.id}
            if source_ids: fc_kwargs["source_ids"] = source_ids
            if difficulty: fc_kwargs["difficulty"] = difficulty
            fc_status = await client.artifacts.generate_flashcards(**fc_kwargs)
            await client.artifacts.wait_for_completion(nb.id, fc_status.task_id)
            fc_file = f"flashcards_{job_id}.json"
            await client.artifacts.download_flashcards(nb.id, str(DOWNLOADS_DIR / fc_file), output_format="json")

            _update_job(job_id, progress=80)
            sg_status = await client.artifacts.generate_study_guide(nb.id, language=req.language)
            await client.artifacts.wait_for_completion(nb.id, sg_status.task_id)
            sg_file = f"study_guide_{job_id}.md"
            await client.artifacts.download_report(nb.id, str(DOWNLOADS_DIR / sg_file))

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
    try:
        _update_job(job_id, status="running", progress=10)

        if not HAS_NOTEBOOKLM:
            await asyncio.sleep(1); _update_job(job_id, progress=30)
            await asyncio.sleep(2); _update_job(job_id, progress=60)
            await asyncio.sleep(1); _update_job(job_id, progress=90)
            result = {
                "notebook_title": req.title,
                "query": req.query,
                "report": f"# Research Report: {req.query}\n\nThis is a demo report. Install `notebooklm-py` for real results.\n\n## Executive Summary\nAnalysis of '{req.query}' across multiple sources.\n\n## Key Findings\n1. Finding one — demonstrates key insight\n2. Finding two — reveals important pattern\n3. Finding three — suggests future direction\n\n## Conclusion\nFurther investigation recommended.",
                "mind_map": {
                    "name": req.query,
                    "children": [
                        {"name": "Subtopic A", "children": [{"name": "Detail 1"}, {"name": "Detail 2"}]},
                        {"name": "Subtopic B", "children": [{"name": "Detail 3"}, {"name": "Detail 4"}]},
                        {"name": "Subtopic C", "children": [{"name": "Detail 5"}]},
                    ],
                },
                "sources_found": 5,
                "demo": True,
            }
            _update_job(job_id, status="completed", progress=100, result=result)
            return

        async with await NotebookLMClient.from_storage() as client:
            nb = await client.notebooks.create(req.title)
            _update_job(job_id, progress=15)

            _update_job(job_id, progress=20)
            research_result = await client.research.start(nb.id, req.query, req.source, req.mode)
            if not research_result:
                raise Exception("Research task failed to start")
            task_id = research_result["task_id"]

            _update_job(job_id, progress=30)
            for poll_i in range(60):
                poll_result = await client.research.poll(nb.id)
                if poll_result.get("status") == "completed":
                    break
                await asyncio.sleep(5)
                _update_job(job_id, progress=min(30 + int(poll_i / 60 * 20), 49))
            else:
                raise Exception("Research timed out")

            _update_job(job_id, progress=50)
            discovered = poll_result.get("sources", [])
            if req.auto_import and discovered:
                await client.research.import_sources(nb.id, task_id, discovered)
                await asyncio.sleep(5)

            _update_job(job_id, progress=60)
            if ReportFormat:
                report_status = await client.artifacts.generate_report(nb.id, report_format=ReportFormat.BRIEFING_DOC)
            else:
                report_status = await client.artifacts.generate_report(nb.id)
            await client.artifacts.wait_for_completion(nb.id, report_status.task_id)
            report_file = f"report_{job_id}.md"
            await client.artifacts.download_report(nb.id, str(DOWNLOADS_DIR / report_file))

            _update_job(job_id, progress=80)
            mm_result = await client.artifacts.generate_mind_map(nb.id)
            mm_data = mm_result.get("mind_map", {})
            mm_file = f"mindmap_{job_id}.json"
            (DOWNLOADS_DIR / mm_file).write_text(json.dumps(mm_data, indent=2, ensure_ascii=False), encoding="utf-8")

            report_content = (DOWNLOADS_DIR / report_file).read_text()

            result = {
                "notebook_id": nb.id,
                "notebook_title": req.title,
                "query": req.query,
                "report": report_content,
                "mind_map": mm_data,
                "sources_found": len(discovered),
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


@app.post("/api/nlm/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a PDF or document file. Returns a file_id to use with other endpoints."""
    allowed_extensions = {".pdf", ".txt", ".md", ".epub", ".docx"}
    ext = Path(file.filename or "file").suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(400, f"File type '{ext}' not supported. Allowed: {', '.join(allowed_extensions)}")

    file_id = f"{uuid.uuid4().hex[:12]}{ext}"
    file_path = UPLOADS_DIR / file_id

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "file_id": file_id,
        "filename": file.filename,
        "size": len(content),
        "type": ext,
    }


@app.post("/api/nlm/podcast")
async def generate_podcast(req: PodcastRequest, bg: BackgroundTasks):
    if not req.sources and not req.files:
        raise HTTPException(400, "At least one source URL, text, or file is required")
    job_id = _create_job("podcast", req.title)
    bg.add_task(_run_podcast_pipeline, job_id, req)
    return {"job_id": job_id, "status": "pending"}


@app.post("/api/nlm/study-kit")
async def generate_study_kit(req: StudyKitRequest, bg: BackgroundTasks):
    if not req.sources and not req.files:
        raise HTTPException(400, "At least one source URL, text, or file is required")
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
    return {"job_id": job_id, **JOBS[job_id]}


@app.get("/api/nlm/jobs")
async def list_jobs():
    return [{"job_id": k, **v} for k, v in sorted(JOBS.items(), key=lambda x: x[1]["created_at"], reverse=True)]


@app.get("/api/nlm/download/{filename}")
async def download_file(filename: str):
    filepath = DOWNLOADS_DIR / filename
    if not filepath.exists():
        raise HTTPException(404, "File not found")
    return FileResponse(str(filepath), filename=filename)



async def _run_studio_pipeline(job_id: str, req: StudioRequest):
    try:
        _update_job(job_id, status="running", progress=10)

        if not HAS_NOTEBOOKLM:
            await asyncio.sleep(2); _update_job(job_id, progress=50)
            result = {
                "notebook_title": req.title,
                "sources_added": len(req.sources) + len(req.files),
                "artifact_type": req.artifact_type,
                "file_path": None,
                "message": "Demo mode — install notebooklm-py and run 'notebooklm login' for real content",
                "demo": True,
            }
            _update_job(job_id, status="completed", progress=100, result=result)
            return

        async with await NotebookLMClient.from_storage() as client:
            _update_job(job_id, progress=15)
            nb = await client.notebooks.create(req.title)

            source_ids = await _add_sources_to_notebook(
                client, nb.id, req.sources, req.files, job_id, 15, 30
            )

            _update_job(job_id, progress=55)
            
            gen_kwargs = {"notebook_id": nb.id, "language": req.language}
            if source_ids:
                gen_kwargs["source_ids"] = source_ids
                
            atype = req.artifact_type
            filename = f"{atype}_{job_id}"
            output_file = ""
            
            if atype == "audio":
                status = await client.artifacts.generate_audio(**gen_kwargs)
                await client.artifacts.wait_for_completion(nb.id, status.task_id)
                output_file = filename + ".wav"
                await client.artifacts.download_audio(nb.id, str(DOWNLOADS_DIR / output_file))
                
            elif atype == "video":
                status = await client.artifacts.generate_video(**gen_kwargs)
                await client.artifacts.wait_for_completion(nb.id, status.task_id)
                output_file = filename + ".mp4"
                await client.artifacts.download_video(nb.id, str(DOWNLOADS_DIR / output_file))
                
            elif atype == "report":
                status = await client.artifacts.generate_report(**gen_kwargs)
                await client.artifacts.wait_for_completion(nb.id, status.task_id)
                output_file = filename + ".md"
                await client.artifacts.download_report(nb.id, str(DOWNLOADS_DIR / output_file))
                
            elif atype == "quiz":
                status = await client.artifacts.generate_quiz(**gen_kwargs)
                await client.artifacts.wait_for_completion(nb.id, status.task_id)
                output_file = filename + ".json"
                await client.artifacts.download_quiz(nb.id, str(DOWNLOADS_DIR / output_file))
                
            elif atype == "data_table":
                status = await client.artifacts.generate_data_table(**gen_kwargs)
                await client.artifacts.wait_for_completion(nb.id, status.task_id)
                output_file = filename + ".csv"
                await client.artifacts.download_data_table(nb.id, str(DOWNLOADS_DIR / output_file))
                
            elif atype == "slide_deck":
                status = await client.artifacts.generate_slide_deck(**gen_kwargs)
                await client.artifacts.wait_for_completion(nb.id, status.task_id)
                output_file = filename + ".pdf"
                await client.artifacts.download_slide_deck(nb.id, str(DOWNLOADS_DIR / output_file), output_format="pdf")
                
            elif atype == "mind_map":
                status = await client.artifacts.generate_mind_map(**gen_kwargs)
                await client.artifacts.wait_for_completion(nb.id, status.task_id)
                output_file = filename + ".json"
                await client.artifacts.download_mind_map(nb.id, str(DOWNLOADS_DIR / output_file))
                
            elif atype == "flashcards":
                status = await client.artifacts.generate_flashcards(**gen_kwargs)
                await client.artifacts.wait_for_completion(nb.id, status.task_id)
                output_file = filename + ".json"
                await client.artifacts.download_flashcards(nb.id, str(DOWNLOADS_DIR / output_file))
                
            elif atype == "infographic":
                status = await client.artifacts.generate_infographic(**gen_kwargs)
                await client.artifacts.wait_for_completion(nb.id, status.task_id)
                output_file = filename + ".png"
                await client.artifacts.download_infographic(nb.id, str(DOWNLOADS_DIR / output_file))
            else:
                raise ValueError("Unknown artifact type")

            _update_job(job_id, progress=85)

            result = {
                "notebook_id": nb.id,
                "notebook_title": req.title,
                "sources_added": len(source_ids),
                "artifact_type": atype,
                "file_path": output_file,
                "demo": False,
            }
            _update_job(job_id, status="completed", progress=100, result=result)

    except Exception as e:
        _update_job(job_id, status="failed", error=str(e))

@app.post("/api/nlm/studio")
async def start_studio(req: StudioRequest, background_tasks: BackgroundTasks):
    job_id = _create_job(req.artifact_type, req.title)
    background_tasks.add_task(_run_studio_pipeline, job_id, req)
    return {"status": "accepted", "job_id": job_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
