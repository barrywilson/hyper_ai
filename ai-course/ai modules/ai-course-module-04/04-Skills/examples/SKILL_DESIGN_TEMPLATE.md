# Pairing Skill — Design Document Template
**Module 4 exercise | Phase 2: Pair Agent**

> This is your design doc. Fill it in with your agent — use it as the spec you hand back to your agent when it's time to implement. The more clearly you define it here, the better the implementation will be.

---

## Skill overview

**Skill name** (snake_case, used as the slash command):
```
/
```

**One-line description** (what does this skill do, from the user's perspective?):


**When would you invoke this?** (describe the moment — what are you about to do, what's missing, why does this help?):


---

## Inputs

What does the user provide when they invoke this skill? List everything the skill needs to work well. Some of these will be explicit (the user types them), some will be implicit (the script gathers them automatically).

**Explicit inputs** (what the user types or pastes):

| Input | Description | Required? |
|-------|-------------|-----------|
| | | |

**Implicit inputs** (what the script will gather from the environment):

| Input | Where it comes from | Why it's needed |
|-------|---------------------|-----------------|
| | | |

---

## What the LLM does

Describe the reasoning the LLM should do — not the answer it should produce, but the *thinking* it should apply.

**Step 1:**

**Step 2:**

**Step 3 (if needed):**

---

## Output format

What does the skill produce? Be specific — a well-designed skill produces consistent, structured output that the user (and eventually the pair agent) can rely on.

**Format** (prose, markdown sections, bullet list, JSON, etc.):

**Sections the output should always include:**

1.
2.
3.

**What should NOT be in the output** (things the skill should avoid or explicitly exclude):


---

## Script responsibility

Which facts should the script gather — things that are deterministic and should not be left to LLM inference?

| Fact | How the script gets it | Format passed to LLM |
|------|----------------------|----------------------|
| | | |

> **Guideline:** If the LLM could reasonably guess it from its training data, it doesn't need a script. If it requires knowing the current state of your specific codebase, repo, or environment — it needs a script.

---

## Failure modes to consider

What happens when the skill gets it wrong? How bad is that?

**If invoked by a human:** *(they can read the output and catch errors)*

**If invoked by the pair agent in Module 6:** *(errors might propagate further downstream)*

What validation or caveats should the skill include to make failures visible rather than silent?


---

## How you'll know it's working

Describe a successful invocation. What input will you give it? What output do you expect?

**Test invocation:**
```
/your-skill-name [inputs here]
```

**Expected output (rough sketch):**


---

## Notes and decisions

Anything you want to capture about design choices you made, alternatives you considered, or things to revisit later:

