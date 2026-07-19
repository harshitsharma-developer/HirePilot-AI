from __future__ import annotations

import json
import re
from typing import Any


def _strip_fences(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _remove_trailing_commas(text: str) -> str:
    return re.sub(r",\s*([}\]])", r"\1", text)


def _normalize_quotes(text: str) -> str:
    return (
        text.replace("“", '"')
        .replace("”", '"')
        .replace("‘", "'")
        .replace("’", "'")
    )


def _escape_control_chars_in_strings(text: str) -> str:
    """Escape raw newlines/tabs inside JSON string literals."""
    result: list[str] = []
    in_string = False
    escaped = False
    for char in text:
        if in_string:
            if escaped:
                result.append(char)
                escaped = False
                continue
            if char == "\\":
                result.append(char)
                escaped = True
                continue
            if char == '"':
                result.append(char)
                in_string = False
                continue
            if char == "\n":
                result.append("\\n")
                continue
            if char == "\r":
                result.append("\\r")
                continue
            if char == "\t":
                result.append("\\t")
                continue
            if ord(char) < 32:
                result.append(f"\\u{ord(char):04x}")
                continue
            result.append(char)
            continue

        if char == '"':
            in_string = True
        result.append(char)
    return "".join(result)


def _balance_brackets(text: str) -> str:
    """Close truncated JSON objects/arrays when the model cuts off mid-response."""
    stack: list[str] = []
    in_string = False
    escaped = False
    for char in text:
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char in "{[":
            stack.append("}" if char == "{" else "]")
        elif char in "}]" and stack and char == stack[-1]:
            stack.pop()

    # Drop a dangling incomplete key/value fragment after the last complete comma/bracket.
    trimmed = text.rstrip()
    if trimmed.endswith(","):
        trimmed = trimmed[:-1]
    if in_string:
        trimmed += '"'
    return trimmed + "".join(reversed(stack))


def _candidate_payloads(text: str) -> list[str]:
    cleaned = _strip_fences(text)
    candidates = [cleaned]

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        candidates.append(match.group(0))

    # Prefer the largest object-looking slice if multiple exist.
    objects = re.findall(r"\{[\s\S]*\}", cleaned)
    candidates.extend(objects)

    unique: list[str] = []
    seen: set[str] = set()
    for item in candidates:
        if item and item not in seen:
            unique.append(item)
            seen.add(item)
    return unique


def _repair_variants(payload: str) -> list[str]:
    variants = [payload]
    normalized = _normalize_quotes(payload)
    variants.append(normalized)
    variants.append(_remove_trailing_commas(normalized))
    variants.append(_escape_control_chars_in_strings(normalized))
    variants.append(_remove_trailing_commas(_escape_control_chars_in_strings(normalized)))
    variants.append(_balance_brackets(_remove_trailing_commas(_escape_control_chars_in_strings(normalized))))
    unique: list[str] = []
    seen: set[str] = set()
    for item in variants:
        if item and item not in seen:
            unique.append(item)
            seen.add(item)
    return unique


def extract_json(text: str) -> dict[str, Any]:
    """Extract and repair the first JSON object from a model response."""
    if not text:
        raise ValueError("Empty model response")

    errors: list[str] = []
    for payload in _candidate_payloads(text):
        for variant in _repair_variants(payload):
            try:
                data = json.loads(variant)
            except json.JSONDecodeError as exc:
                errors.append(str(exc))
                continue
            if isinstance(data, dict):
                return data
            errors.append("Parsed JSON is not an object")

    detail = errors[-1] if errors else "No JSON object found in model response"
    raise ValueError(detail)
