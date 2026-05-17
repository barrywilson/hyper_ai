# Pairing Skill — Script Design Document Template
**Module 4 exercise | Phase 2: Pair Agent**

> Your skill's script is the grounding layer — it gathers facts from your environment that the LLM can't know on its own. This document defines what the script does. Once you've filled it in, hand it to your agent and ask it to implement the script.

---

## Script overview

**Script name** (file that lives in `.claude/skills/your-skill-name/`):
```
.sh  or  .py
```

**One-line description** (what does this script gather or do?):


**When does the skill invoke this script?** (before the LLM runs? after? between steps?):


---

## Inputs

What does the script receive? These come from either the user's invocation or the environment.

| Input | Source | Description |
|-------|--------|-------------|
| | command-line arg / env variable / working directory | |

---

## Operations

List each thing the script does, in order. Be specific enough that your agent can implement each step without ambiguity.

**Operation 1:**
- What it does:
- Command / approach:
- What it produces:

**Operation 2:**
- What it does:
- Command / approach:
- What it produces:

**Operation 3 (if needed):**
- What it does:
- Command / approach:
- What it produces:

---

## Output format

The script outputs something the LLM reads. Define that format precisely — the more structured, the easier the LLM's job is.

**Output format** (plain text, JSON, markdown, etc.):

**Example output sketch:**
```
[paste a rough example of what the script should output]
```

---

## Error handling

What should the script do when something goes wrong?

| Scenario | What the script should do |
|----------|--------------------------|
| Git repo not found / not in a repo | |
| No recent commits | |
| Test runner not installed / no tests found | |
| Other: | |

> **Guideline:** Failing loudly with a clear message is almost always better than silently returning empty output. The LLM will handle the empty case badly.

---

## Dependencies and assumptions

What does the script assume about the environment?

| Dependency | Required? | What to do if missing |
|------------|-----------|----------------------|
| git | Yes | Exit with error |
| | | |
| | | |

**Which operating systems should this work on?**
- [ ] macOS
- [ ] Linux
- [ ] Windows (WSL)

---

## Implementation prompt

Once you've filled in this document, use a prompt like this with your agent to generate the script:

```
I need you to implement a bash/python script for a Claude Code skill.
Here is the design document:

[paste this filled-in document]

Please implement the script, then suggest how I can test it manually
before wiring it into the skill.
```

---

## Testing checklist

Before wiring the script into your skill, test it directly from the command line:

- [ ] Runs without errors in a repo with recent commits
- [ ] Runs without errors in a fresh/empty repo (edge case)
- [ ] Output format matches what you defined above
- [ ] Error messages are clear and actionable
- [ ] Tested on the Config API repo from Phase 1

---

## Notes and decisions

Anything you want to capture — design choices, alternatives considered, things to revisit:

