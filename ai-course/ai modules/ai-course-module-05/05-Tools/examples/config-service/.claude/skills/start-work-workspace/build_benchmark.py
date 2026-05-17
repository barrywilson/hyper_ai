#!/usr/bin/env python3
"""Build benchmark.json and a static HTML report for an iteration directory."""
from __future__ import annotations

import html
import json
import sys
from pathlib import Path
from statistics import mean


def load_run(run_dir: Path) -> dict:
    grading = json.loads((run_dir / "grading.json").read_text())
    timing = json.loads((run_dir / "timing.json").read_text())
    response = (run_dir / "outputs" / "response.md").read_text()
    return {
        "passed": grading["passed"],
        "total": grading["total"],
        "expectations": grading["expectations"],
        "tokens": timing["total_tokens"],
        "duration_s": timing["total_duration_seconds"],
        "response": response,
    }


def aggregate(runs: list[dict], label: str) -> dict:
    return {
        "config": label,
        "pass_rate": sum(r["passed"] for r in runs) / sum(r["total"] for r in runs),
        "tokens_mean": mean(r["tokens"] for r in runs),
        "duration_mean": mean(r["duration_s"] for r in runs),
    }


def main():
    iteration_dir = Path(sys.argv[1])
    eval_dirs = sorted(d for d in iteration_dir.iterdir() if d.is_dir() and d.name.startswith("eval-"))

    by_eval = []
    with_skill_runs = []
    without_skill_runs = []

    for ed in eval_dirs:
        meta = json.loads((ed / "eval_metadata.json").read_text())
        ws = load_run(ed / "with_skill")
        wo = load_run(ed / "without_skill")
        with_skill_runs.append(ws)
        without_skill_runs.append(wo)
        by_eval.append({
            "eval_id": meta["eval_id"],
            "eval_name": meta["eval_name"],
            "prompt": meta["prompt"],
            "with_skill": ws,
            "without_skill": wo,
        })

    benchmark = {
        "iteration": iteration_dir.name,
        "configs": [
            aggregate(with_skill_runs, "with_skill"),
            aggregate(without_skill_runs, "without_skill"),
        ],
        "evals": by_eval,
    }

    out_path = iteration_dir / "benchmark.json"
    out_path.write_text(json.dumps(benchmark, indent=2))
    print(f"wrote {out_path}")

    # Build static HTML
    html_path = iteration_dir / "report.html"
    write_html(benchmark, html_path)
    print(f"wrote {html_path}")


def write_html(b: dict, out_path: Path):
    rows = []
    for c in b["configs"]:
        rows.append(
            f"<tr><td>{html.escape(c['config'])}</td>"
            f"<td>{c['pass_rate']:.1%}</td>"
            f"<td>{c['tokens_mean']:,.0f}</td>"
            f"<td>{c['duration_mean']:.1f}s</td></tr>"
        )
    summary_table = (
        "<table><thead><tr><th>Config</th><th>Pass rate</th>"
        "<th>Tokens (mean)</th><th>Duration (mean)</th></tr></thead>"
        f"<tbody>{''.join(rows)}</tbody></table>"
    )

    eval_blocks = []
    for ev in b["evals"]:
        ws_grades = render_grading(ev["with_skill"]["expectations"])
        wo_grades = render_grading(ev["without_skill"]["expectations"])
        ws_pass = f"{ev['with_skill']['passed']}/{ev['with_skill']['total']}"
        wo_pass = f"{ev['without_skill']['passed']}/{ev['without_skill']['total']}"
        eval_blocks.append(f"""
<section class="eval">
  <h2>Eval {ev['eval_id']}: {html.escape(ev['eval_name'])}</h2>
  <p class="prompt"><strong>Prompt:</strong> {html.escape(ev['prompt'])}</p>
  <div class="cols">
    <div class="col">
      <h3>With skill ({ws_pass})</h3>
      {ws_grades}
      <details><summary>Response</summary><pre>{html.escape(ev['with_skill']['response'])}</pre></details>
    </div>
    <div class="col">
      <h3>Without skill ({wo_pass})</h3>
      {wo_grades}
      <details><summary>Response</summary><pre>{html.escape(ev['without_skill']['response'])}</pre></details>
    </div>
  </div>
</section>
""")

    page = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>start-work iteration {b['iteration']}</title>
<style>
  body {{ font: 14px/1.5 -apple-system, sans-serif; max-width: 1400px; margin: 2em auto; padding: 0 1em; }}
  table {{ border-collapse: collapse; margin: 1em 0; }}
  th, td {{ border: 1px solid #ccc; padding: 6px 12px; text-align: left; }}
  th {{ background: #f4f4f4; }}
  .cols {{ display: grid; grid-template-columns: 1fr 1fr; gap: 1em; }}
  .col {{ border: 1px solid #ddd; padding: 1em; border-radius: 6px; }}
  .pass {{ color: #1a7f37; }}
  .fail {{ color: #cf222e; }}
  pre {{ white-space: pre-wrap; word-wrap: break-word; background: #f6f8fa; padding: 1em; border-radius: 6px; max-height: 500px; overflow: auto; }}
  details summary {{ cursor: pointer; font-weight: 600; margin: 0.5em 0; }}
  .prompt {{ background: #fffbe6; padding: 0.6em; border-radius: 4px; }}
  ul {{ padding-left: 1.2em; }}
</style></head><body>
<h1>start-work — {b['iteration']}</h1>
<h2>Summary</h2>
{summary_table}
{''.join(eval_blocks)}
</body></html>
"""
    out_path.write_text(page)


def render_grading(expectations: list[dict]) -> str:
    items = []
    for e in expectations:
        cls = "pass" if e["passed"] else "fail"
        mark = "✓" if e["passed"] else "✗"
        items.append(
            f"<li class=\"{cls}\"><strong>{mark} {html.escape(e['text'])}</strong>"
            f"<br><small>{html.escape(e['evidence'])}</small></li>"
        )
    return f"<ul>{''.join(items)}</ul>"


if __name__ == "__main__":
    main()
