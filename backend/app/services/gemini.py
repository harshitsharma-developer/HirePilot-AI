from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import HTTPException
from google import genai
from google.genai import types

from app.config import get_settings
from app.utils.json_extract import extract_json

logger = logging.getLogger(__name__)

REPAIR_PROMPT = """Fix the following into valid JSON only.
Do not add markdown.
Do not explain.
Preserve the original data as closely as possible.

Broken JSON:
"""


class GeminiService:
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.gemini_api_key:
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY is not configured on the server",
            )
        self.model = settings.resolved_gemini_model
        self.client = genai.Client(api_key=settings.gemini_api_key)

    def _generate_text(self, prompt: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                ),
            )
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}") from exc

        text = getattr(response, "text", None) or ""
        if not text and getattr(response, "candidates", None):
            parts = []
            for candidate in response.candidates:
                content = getattr(candidate, "content", None)
                if not content:
                    continue
                for part in getattr(content, "parts", []) or []:
                    if getattr(part, "text", None):
                        parts.append(part.text)
            text = "\n".join(parts)
        return text

    def generate_json(self, prompt: str) -> dict[str, Any]:
        text = self._generate_text(prompt)
        try:
            return extract_json(text)
        except (ValueError, json.JSONDecodeError) as first_exc:
            logger.warning("Gemini JSON parse failed, attempting repair: %s", first_exc)
            repaired_text = self._generate_text(REPAIR_PROMPT + text[:12000])
            try:
                return extract_json(repaired_text)
            except (ValueError, json.JSONDecodeError) as second_exc:
                snippet = (text or "")[:400].replace("\n", " ")
                raise HTTPException(
                    status_code=502,
                    detail=f"Failed to parse Gemini JSON: {second_exc}. Snippet: {snippet}",
                ) from second_exc


def get_gemini() -> GeminiService:
    return GeminiService()
