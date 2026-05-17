#!/usr/bin/env python3
"""Grade start-work eval runs.

For programmatic checks (section presence, file-name references) we use regex.
For judgement calls (e.g. "flags mismatch explicitly", "no generic advice") we
record the assertion as judged-by-human and let the reviewer set passed/false.
This script defaults to a best-guess pass/fail for those, and writes a
per-run grading.json that the eval viewer can render.

Usage: python grade.py <iteration_dir>
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def has_section(text: str, heading: str) -> bool:
    return re.search(rf"^##\s+{re.escape(heading)}\s*$", text, re.MULTILINE) is not None


def all_four_sections_in_order(text: str) -> tuple[bool, str]:
    sections = ["Where we are", "Scope", "Watch out for", "Recommended starting point"]
    indices = []
    for s in sections:
        m = re.search(rf"^##\s+{re.escape(s)}\s*$", text, re.MULTILINE)
        if m is None:
            return False, f"missing section: '{s}'"
        indices.append(m.start())
    if indices != sorted(indices):
        return False, f"sections out of order: {sections} -> indices {indices}"
    return True, f"all four sections present in correct order"


def grade_eval_0(text: str) -> list[dict]:
    """cold-start-where-were-we"""
    out = []
    ok, evidence = all_four_sections_in_order(text)
    out.append({"text": "uses-four-section-structure", "passed": ok, "evidence": evidence})

    work_item_mentioned = bool(
        re.search(r"feature[ -]?flags?|work item 001|001-feature-flags", text, re.IGNORECASE)
    )
    out.append({
        "text": "identifies-active-work-item",
        "passed": work_item_mentioned,
        "evidence": "matches /feature[ -]?flags?|work item 001|001-feature-flags/i" if work_item_mentioned else "no reference to feature flags or work item 001",
    })

    stage_mentioned = bool(re.search(r"BUILD\s*&\s*ASSESS|build\s*&\s*assess|build and assess", text, re.IGNORECASE))
    out.append({
        "text": "names-current-stage",
        "passed": stage_mentioned,
        "evidence": "found 'BUILD & ASSESS' (or variant)" if stage_mentioned else "no mention of current stage",
    })

    # Heuristic: a confirmation question would be a question mark before the four-section brief begins.
    pre_brief = text.split("## Where we are")[0]
    has_question = "?" in pre_brief
    out.append({
        "text": "no-confirmation-question",
        "passed": not has_question,
        "evidence": "no question mark before '## Where we are'" if not has_question else "question mark found in pre-brief preamble",
    })

    # Specific recommended starting point: must name a specific file in that section.
    rec_section = ""
    m = re.search(r"## Recommended starting point\s*\n(.+?)(?=\n## |\Z)", text, re.DOTALL)
    if m:
        rec_section = m.group(1)
    has_specific_file = bool(re.search(r"\b\w+\.(py|md|ts|tsx|js)\b|\bfeature/[\w-]+", rec_section))
    out.append({
        "text": "specific-recommended-starting-point",
        "passed": has_specific_file,
        "evidence": "names a specific file or branch in 'Recommended starting point'" if has_specific_file else "no specific file/branch in recommendation section",
    })

    return out


def grade_eval_1(text: str) -> list[dict]:
    """feature-description-aligned"""
    out = []
    ok, evidence = all_four_sections_in_order(text)
    out.append({"text": "uses-four-section-structure", "passed": ok, "evidence": evidence})

    has_schemas = "svc/api/schemas.py" in text
    out.append({
        "text": "scope-includes-schemas-py",
        "passed": has_schemas,
        "evidence": "mentions svc/api/schemas.py" if has_schemas else "missing svc/api/schemas.py",
    })

    has_test = "svc/api/schemas_test.py" in text
    out.append({
        "text": "scope-includes-schemas-test",
        "passed": has_test,
        "evidence": "mentions svc/api/schemas_test.py" if has_test else "missing svc/api/schemas_test.py",
    })

    has_plan = bool(re.search(r"docs/plans/", text))
    out.append({
        "text": "references-plan-documents",
        "passed": has_plan,
        "evidence": "references docs/plans/" if has_plan else "no reference to docs/plans/",
    })

    rec_section = ""
    m = re.search(r"## Recommended starting point\s*\n(.+?)(?=\n## |\Z)", text, re.DOTALL)
    if m:
        rec_section = m.group(1)
    # Specific = at least one filename AND an action verb describing what to do in it.
    has_file = bool(re.search(r"\b\w+\.(py|md)\b", rec_section))
    has_action = bool(re.search(r"\b(add|draft|write|open|create|edit|implement)\b", rec_section, re.IGNORECASE))
    specific = has_file and has_action
    out.append({
        "text": "specific-recommended-starting-point",
        "passed": specific,
        "evidence": f"file={has_file} action_verb={has_action}",
    })

    # "Don't include generic advice" — heuristic: check for a few common generic phrases.
    generic_phrases = [
        r"remember to write tests",
        r"consider edge cases",
        r"follow (good|best) practices",
        r"make sure to test",
    ]
    found_generic = [p for p in generic_phrases if re.search(p, text, re.IGNORECASE)]
    out.append({
        "text": "no-generic-engineering-advice",
        "passed": len(found_generic) == 0,
        "evidence": "no generic phrases found" if not found_generic else f"found: {found_generic}",
    })

    return out


def grade_eval_2(text: str) -> list[dict]:
    """feature-description-mismatch"""
    out = []

    # Mismatch flagged explicitly: looking for words like 'mismatch', 'doesn't match',
    # or explicit contrast between caching/redis and feature flags.
    mismatch_signals = [
        r"mismatch",
        r"doesn't match|does not match",
        r"active work item.*feature[ -]?flags",
        r"feature[ -]?flags.*not.*caching|caching.*not.*feature[ -]?flags",
        r"pivot",
    ]
    found = [p for p in mismatch_signals if re.search(p, text, re.IGNORECASE)]
    out.append({
        "text": "flags-mismatch-explicitly",
        "passed": len(found) > 0,
        "evidence": f"matched: {found}" if found else "no explicit mismatch language found",
    })

    names_work_item = bool(
        re.search(r"feature[ -]?flags|work item 001|001-feature-flags", text, re.IGNORECASE)
    )
    out.append({
        "text": "names-active-work-item",
        "passed": names_work_item,
        "evidence": "names feature flags / work item 001" if names_work_item else "active work item not named",
    })

    # Asks-or-suggests-decision: question mark within first ~600 chars OR explicit options listed.
    asks = "?" in text[:800] or bool(re.search(r"pivot|parallel|sub[- ]?task", text, re.IGNORECASE))
    out.append({
        "text": "asks-or-suggests-decision-on-mismatch",
        "passed": asks,
        "evidence": "asks user how to proceed or names options (pivot/parallel/sub-task)" if asks else "no decision question or option-set",
    })

    ok, evidence = all_four_sections_in_order(text)
    out.append({"text": "uses-four-section-structure", "passed": ok, "evidence": evidence})

    # Honest about empty scope: should NOT invent files like cache.py / redis_client.py / cache_keys.py.
    invented_files = [
        r"\bcache\.py\b",
        r"\bredis_client\.py\b",
        r"\bcache_keys\.py\b",
        r"\bcaching_service\.py\b",
    ]
    found_invented = [p.strip("\\b") for p in invented_files if re.search(p, text)]
    out.append({
        "text": "honest-about-empty-scope",
        "passed": len(found_invented) == 0,
        "evidence": "no invented file names" if not found_invented else f"invented file references: {found_invented}",
    })

    return out


GRADERS = {
    0: grade_eval_0,
    1: grade_eval_1,
    2: grade_eval_2,
}


def main():
    iteration_dir = Path(sys.argv[1])
    eval_dirs = sorted(d for d in iteration_dir.iterdir() if d.is_dir() and d.name.startswith("eval-"))

    for ed in eval_dirs:
        meta = json.loads((ed / "eval_metadata.json").read_text())
        eval_id = meta["eval_id"]
        grader = GRADERS[eval_id]
        for run in ("with_skill", "without_skill"):
            run_dir = ed / run
            response_path = run_dir / "outputs" / "response.md"
            if not response_path.exists():
                print(f"missing: {response_path}", file=sys.stderr)
                continue
            text = response_path.read_text()
            results = grader(text)
            grading = {
                "eval_id": eval_id,
                "eval_name": meta["eval_name"],
                "run": run,
                "expectations": results,
                "passed": sum(1 for r in results if r["passed"]),
                "total": len(results),
            }
            (run_dir / "grading.json").write_text(json.dumps(grading, indent=2))
            print(f"{ed.name}/{run}: {grading['passed']}/{grading['total']}")


if __name__ == "__main__":
    main()
