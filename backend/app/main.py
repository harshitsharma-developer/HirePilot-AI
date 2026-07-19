from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models.schemas import HealthResponse
from app.routers import analyze, optimize, pdf, upload

settings = get_settings()

app = FastAPI(title="HirePilot AI", version="1.0.0")

# Local hackathon setup: allow localhost variants used by Next.js / browsers.
cors_origins = settings.cors_origin_list or [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(optimize.router)
app.include_router(pdf.router)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse()
