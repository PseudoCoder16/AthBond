import os
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.rag_service import RAGCoachService
from services.analysis_service import AnalysisService


class CoachQueryRequest(BaseModel):
    question: str


app = FastAPI(title="AthBond AI Services", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).resolve().parent / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

rag_service = RAGCoachService()
analysis_service = AnalysisService()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ai/upload-document")
async def upload_document(file: UploadFile = File(...)):
    allowed = {".pdf", ".doc", ".docx", ".txt"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported document type")

    target_path = UPLOAD_DIR / file.filename
    with open(target_path, "wb") as out:
        out.write(await file.read())

    result = rag_service.ingest(str(target_path))
    return {"success": True, **result}


@app.post("/ai/coach-query")
async def coach_query(payload: CoachQueryRequest):
    return {"success": True, **rag_service.query(payload.question)}


@app.post("/ai/analyze-video")
async def analyze_video(video: UploadFile = File(...), metadata: Optional[str] = Form(default="{}")):
    # Save to disk to keep compatibility with production media pipelines.
    target_path = UPLOAD_DIR / video.filename
    with open(target_path, "wb") as out:
        out.write(await video.read())
    return analysis_service.analyze_video({"video_path": str(target_path), "meta": metadata})
