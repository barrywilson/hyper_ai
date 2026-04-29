# Development Journal - Module 1

## Core Principles
- Keep it simple - no bloatware
- Ask questions, don't assume
- No extra dependencies without approval
- Basic web/API structure only
- Node.js focused (no Python)

## Challenges & Lessons Learned

### Issue: Over-Engineering & Bloatware
**Problem:** AI generated overly complex code for simple tasks. What should be straightforward became unnecessarily complicated.

**Examples:**
- 212-line Python-heavy .gitignore for a Node.js-only project
- 515-line README with excessive "why" explanations nobody asked for
- Complex patterns when simple solutions would work

**Solution:** Strip it down. Keep it clean. If it's not needed, remove it.

### Issue: Teaching the AI
**Problem:** Had to repeatedly guide the AI to understand simplicity. It defaults to verbose, framework-heavy solutions. Kept redoing things the same way even when told "don't."

**Approach:**
- Be explicit: "This is too wordy"
- Set boundaries: "Never used Python, just Node apps"
- Demand clarity: "Keep it clean"
- Reject bloat: Remove unnecessary explanations

**Frustration:** Every change or suggestion costs money. AI doesn't learn from "don't do that" in the same session.

### Issue: Undoing the Mess
**Problem:** Spent time cleaning up over-engineered code instead of building features.

**Actions Taken:**
1. Simplified README from 515 → 245 lines
2. Cleaned .gitignore from 212 → 18 lines (Node.js only)
3. Removed "why use this pattern" sections
4. Focused on what, not why

### Issue: Real Cost of Bloatware
**Problem:** Code bloat costs real money. Using ACT mode to generate and then fix unnecessary complexity burns through tokens.

**Impact:**
- AI generates 500+ lines when 50 would do
- Then costs more tokens to clean it up
- Wasted money on bloatware nobody asked for
- Could have built features instead of undoing mess

**Lesson:** Bloat isn't just annoying—it's expensive. Every unnecessary line costs money.

### The Trade-Off
**Why Still Use It?**
- Speed: Gets things done fast
- Design Understanding: Grasps complex patterns quickly
- Productivity: When it works right, it's powerful

**The Reality:**
The speed and design comprehension tips the scale. Despite the cost of fixing bloat and repeating corrections, it's still faster than doing it all manually. But it's expensive when it doesn't listen.

### Key Takeaway
**Simple is better.** The best code is no code. The second best is clean, minimal code that does the job. Bloatware costs real money. The AI is worth it for speed and design understanding, but every mistake costs.

---

## Reflections: Spec → Prompt → Plan → Implement Cycle

### 1. Control vs. Sideways Moments
**Easy to lose control.**

The AI can quickly take things in unintended directions. Without strong guardrails, it defaults to over-engineering.

### 2. Detail Level Needed
**More instructions the better, BUT losing control of the controller documents. Too much.**

Paradox: Need detail to guide the AI effectively, but the control documents (AGENTS.md, memory files) themselves became bloated and hard to manage. Finding the right balance is critical.

### 3. Journal Usefulness
**Helpful when overloaded.**

The journal serves as a cognitive offload tool. When there's too much to track mentally, it becomes valuable. Not overhead—it's a thinking aid.

### 4. Surprises About Not Coding
**No surprises. Been doing this for some time but not as well organized or caring about cost.**

Already experienced with AI-assisted coding. This exercise was about bringing structure, organization, and cost awareness to the process—not learning the basics.

### 5. Rules Captured
**All rules just to remind myself what I want to do in the future.**

The rules aren't universal truths—they're personal preferences captured for consistency. Future-self reminders, not commandments.

### 6. What to Do Differently Next Time
**Make sure these agents are in place first. CRITICAL.**

The AGENTS.md and memory files need to be set up BEFORE starting work. They're the foundation for control. Without them, you're fighting the AI's defaults from the start.

### Meta-Insight
The cycle works, but only with proper scaffolding. The agents/memory system is non-negotiable—it's the difference between guiding the AI and wrestling with it.

---

## Session Progress - Config Service Implementation

### Completed Tasks:
1. ✅ Created config-service project structure
2. ✅ Implemented backend API with Node.js/Express
   - Database connection (src/db.js)
   - API resolver pattern (src/resolvers/)
   - Main server (src/server.js)
3. ✅ Implemented frontend interface
   - Custom elements (vanilla JS)
   - Admin dashboard
   - Read-only view
4. ✅ Created Jest test suite
5. ✅ Set up MySQL database with Docker
6. ✅ Cleaned up documentation (removed bloat)

### Dependencies:
- express
- mysql2
- dotenv
- cors
- jest (dev)
- supertest (dev)

### Project Structure:
```
ai-course/module1/
├── config-service/
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── resolvers/
│   │   └── public/
│   ├── tests/
│   └── templates/
├── docker-compose.yml
└── init.sql
```

### Commands:
```bash
# Start database
docker-compose up -d

# Install & run
cd config-service
npm install
npm start

# Test
npm test
```

### Notes:
- API Resolver Pattern (dynamic namespace/version loading)
- Custom Elements (no frameworks)
- Docker MySQL (ephemeral testing)
- Clean, minimal code
