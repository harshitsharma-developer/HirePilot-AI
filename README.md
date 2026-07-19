# HirePilot AI

Your AI Career Copilot — upload a resume, paste a job description, get an ATS score with a clear **Why this score?** explanation, optimize wording, and download a PDF.

No authentication. No database. No job scraping.

## Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI, Framer Motion
- **Backend:** FastAPI, Gemini 2.5 Flash, PyMuPDF, python-docx, reportlab
- **Deploy:** Vercel (frontend) + Render (backend)

## Project structure

```
frontend/     Next.js app
backend/      FastAPI API
```

## Local setup

### 1. Backend

```bash
cd backend
py -3.13 -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env
```

Add your Gemini key to `backend/.env`:

```
GEMINI_API_KEY=your_key_here
CORS_ORIGINS=http://localhost:3000
```

Start the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env.local   # or: cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/upload-resume` | Parse PDF/DOCX → structured resume JSON |
| POST | `/analyze-job` | Job parse + ATS report + why_score |
| POST | `/optimize-resume` | Optimized resume + accept/reject changes |
| POST | `/generate-pdf` | Download optimized resume PDF |
| GET | `/health` | Liveness |

## Demo walkthrough

1. Landing → **Get Started**
2. Upload PDF/DOCX resume
3. Review extracted summary
4. Paste a job description → **Analyze**
5. Read ATS score + **Why this score?** + interview probability
6. **Optimize Resume** → Accept/Reject suggestions
7. Preview → **Download PDF**

## Deploy

### Frontend (Vercel)

1. Import the `frontend` folder (or monorepo with root = `frontend`)
2. Set `NEXT_PUBLIC_API_URL` to your Render backend URL

### Backend (Render)

1. Deploy `backend` with the included `Dockerfile` / `render.yaml`
2. Set `GEMINI_API_KEY`
3. Set `CORS_ORIGINS` to your Vercel URL (comma-separated if multiple)

## Notes

- Max resume size: 5MB
- Supported formats: PDF, DOCX
- Gemini never invents experience — prompts enforce compare/rewrite-only behavior
