import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add sqlite3 import
if 'import sqlite3' not in code:
    code = code.replace('import asyncio\n', 'import asyncio\nimport sqlite3\nimport time\n')

# 2. Add DB init logic
db_init_code = '''
# ---------------------------------------------------------------------------
# Directories & DB
# ---------------------------------------------------------------------------
DOWNLOADS_DIR = Path(__file__).parent / "downloads"
UPLOADS_DIR = Path(__file__).parent / "uploads"
DOWNLOADS_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)

DB_PATH = Path(__file__).parent / "jobs.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                job_id TEXT PRIMARY KEY,
                status TEXT,
                type TEXT,
                title TEXT,
                progress INTEGER,
                result TEXT,
                error TEXT,
                created_at TEXT
            )
        """)
init_db()

def _create_job(job_type: str, title: str) -> str:
    job_id = str(uuid.uuid4())[:8]
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO jobs (job_id, status, type, title, progress, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (job_id, "pending", job_type, title, 0, datetime.now().isoformat())
        )
    return job_id

def _update_job(job_id: str, **kwargs):
    updates = []
    values = []
    for k, v in kwargs.items():
        updates.append(f"{k} = ?")
        values.append(json.dumps(v) if k == "result" else v)
    
    if not updates: return
    
    values.append(job_id)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(f"UPDATE jobs SET {', '.join(updates)} WHERE job_id = ?", values)

def _get_jobs():
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM jobs ORDER BY created_at DESC").fetchall()
        jobs = []
        for r in rows:
            job = dict(r)
            if job["result"]:
                try: job["result"] = json.loads(job["result"])
                except: pass
            jobs.append(job)
        return jobs

async def _cleanup_old_files():
    """Background task to delete files older than 24 hours."""
    while True:
        try:
            now = time.time()
            max_age = 24 * 3600 # 24 hours
            for d in [DOWNLOADS_DIR, UPLOADS_DIR]:
                if not d.exists(): continue
                for f in d.iterdir():
                    if f.is_file() and (now - f.stat().st_mtime) > max_age:
                        f.unlink()
        except: pass
        await asyncio.sleep(3600) # Check every hour

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(_cleanup_old_files())
'''

# We want to replace the `JOBS = {}` block through `def _update_job(job_id: str, **kwargs): ...`
code = re.sub(
    r'JOBS:\s*dict\s*=\s*{}.*?def _update_job\(job_id:\s*str,\s*\*\*kwargs\):.*?JOBS\[job_id\]\.update\(kwargs\)',
    db_init_code.strip(),
    code,
    flags=re.DOTALL
)

# 3. Fix list_jobs endpoint
code = re.sub(
    r'@app\.get\("/api/nlm/jobs"\).*?return list\(reversed\(list\(JOBS\.values\(\)\)\)\)[:20]',
    '@app.get("/api/nlm/jobs")\nasync def list_jobs():\n    return _get_jobs()[:20]',
    code,
    flags=re.DOTALL
)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patch applied successfully.")
