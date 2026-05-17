# Workflow & Status

This document defines the development workflow, task breakdown approach, and commit practices for the Configuration Service project.

## Four-Stage Development Process

Every work item follows a structured four-stage process to ensure quality, consistency, and continuous improvement. The coding assistant and user must both understand and follow this process rigorously.

### Process Overview

1. **PLAN**: Story planning → Task planning (given-when-then acceptance criteria)
2. **BUILD & ASSESS**: Implementation → Testing → Quality validation
3. **REFLECT & ADAPT**: Process assessment → Future task adjustment
4. **COMMIT & PICK NEXT**: Commit creation → Branch management → Next task selection

### Stage Definitions

#### Stage 1: PLAN
**Story Planning → Task Planning → Branch Creation**

- **Story Planning**: Break down work item into acceptance criteria using Given-When-Then format
- **Task Planning**: For each Given-When-Then scenario, define:
  - **Test Strategy**: What tests are needed for confidence (unit, integration, edge cases)?
  - **File Changes**: What code changes are required?
- **Branch Setup**: Create feature branch and commit the completed plan
- **Output**: Clear understanding of what to test and what to implement, with plan committed to feature branch
- **Completion Criteria**: Test strategy and file changes identified, feature branch created, and plan committed

#### Stage 2: BUILD & ASSESS
**Implementation → Testing → Quality Validation**

- **Build Loop**: Implement the behavior and tests identified in planning
- **Assess Loop**: Validate current working tree against task requirements
  - Run tests and ensure they pass
  - Verify implementation matches acceptance criteria
  - Ensure all quality checks pass (linting, formatting, type checking)
  - Ensure consistent coding and testing patterns
- **Output**: Working, tested code that satisfies the acceptance criteria
- **Completion Criteria**: ALL quality validation passes cleanly without errors or warnings

#### Stage 3: REFLECT & ADAPT
**Process Assessment → Future Task Adjustment**

- **Process Reflection**: Assess how the PLAN and BUILD & ASSESS stages went
  - What friction was encountered?
  - How can the process be improved next time?
  - Should templates or workflows be updated?
- **Future Task Assessment**: Review remaining work in light of current implementation
  - Do remaining Given-When-Then tasks need adjustment?
  - Are new tasks needed?
  - Should task order be rearranged?
- **Output**: Process improvements and updated task plan
- **Completion Criteria**: Both process assessment and future task review are complete

#### Stage 4: COMMIT & PICK NEXT
**Commit Creation → README Review → Purge → Next Task Selection**

- **Commit Preparation**: Create commit with conventional commit message
- **Branch Management**: Ensure proper branch setup and tracking
- **README Review**: Check the README in every folder you touched or added code to. Update any that no longer accurately describe what is there. This keeps the project's knowledge graph current — a quick check at the end of each task, not a big documentation effort.
- **Purge stage details (work-item file)**: Delete the PLAN, BUILD & ASSESS, and REFLECT & ADAPT notes from the work-item file. Keep the acceptance criteria and completion status. The code is the truth; the working scaffolding is noise.

  Standalone planning documents under `docs/plans/` are reference scaffolding kept *while the work item is in flight*, then deleted when the entire work item completes.
- **Next Task Selection**: Choose the next Given-When-Then task to work on
- **Output**: Clean commit, current docs, and clear next steps
- **Completion Criteria**: Commit is made, READMEs are current, work item is pruned, and next task is identified

### Stage Transition Rules

**CRITICAL**: Each stage must be completed fully before moving to the next stage. No exceptions.

**USER-DRIVEN STAGE COMPLETION PROTOCOL**:
- **ONLY the user decides when a stage is complete and when to transition to the next stage**
- The assistant MUST NOT declare stage completion or suggest moving to the next stage
- The assistant should continue collaborating on the current stage until the user explicitly states readiness to move forward
- The user will be very clear and explicit when directing stage transitions (e.g., "Let's move to BUILD & ASSESS stage")
- Assistant should focus on completing stage work thoroughly and responding to user direction

**Stage Transition Requirements:**
- **PLAN → BUILD & ASSESS**: User confirms test strategy and file changes are clearly defined
- **BUILD & ASSESS → REFLECT & ADAPT**: User confirms ALL quality validation passes cleanly
- **REFLECT & ADAPT → COMMIT & PICK NEXT**: User confirms process assessment and future task review are complete
- **COMMIT & PICK NEXT → PLAN**: User directs beginning of next Given-When-Then task planning

## Work Item Structure

### Story (also called Work Item)
A **story** (interchangeably called a **work item**) represents a complete feature that provides business value:
- Documented in numbered work item file (e.g., `docs/001-feature-name.md`)
- Contains multiple Given-When-Then acceptance criteria
- Represents the scope of a feature branch
- Results in a pull request when complete

### Acceptance Criterion (the unit of task work; "Criteria N" in work-item files)
An **acceptance criterion** represents a single behavioral scenario within a story:
- Expressed as a Given-When-Then statement
- Listed inside the work-item file's "Acceptance Criteria" section as `#### Criteria N: …` (see `docs/template.md`)
- Represents the unit of *task* work — roughly 1–3 commits — that goes through the four-stage process
- Has clear, testable completion criteria

> **Terminology aliasing.** Within the workflow stages, the unit of work-in-progress is sometimes referred to as a "task" (e.g., "Active Task", "Next Task Selection"). That "task" is the work that satisfies a single Criterion. The two terms describe the same unit from different angles: *Criterion* is the spec, *Task* is the work to satisfy it.

### Working Document Pattern
- Copy `docs/template.md` to create numbered story files
- Story file becomes the active working document
- Contains all detailed tracking for current task and stage
- Once a task is committed: purge stage tracking details (PLAN notes, BUILD notes, REFLECT notes) from the *work-item file*. Keep the acceptance criteria and their completion status. Standalone plan documents under `docs/plans/` stay until the entire work item is complete.
- Update with next task details
- Document always reflects the current task and stage, nothing more

> **Purge discipline**: Stage notes inside the *work-item file* (PLAN/BUILD/REFLECT) are scaffolding — they serve the task, not the history. Purge after each task commit. *Standalone* planning documents under `docs/plans/` are retained while the work item is in flight (so they're available as reference during BUILD), then removed when the work item completes. The code is the long-term truth; working notes are short-term.

## Development Commands

### Quality Validation (Required Every BUILD & ASSESS Stage)
```bash
# Per task quality checks (ALL must pass cleanly):
make test                         # Unit tests must pass
make lint                         # Python code linting
make format                       # Python code formatting
cd ui && npm run type-check       # TypeScript validation

# Before merging to main:
make test                         # All tests including integration
```

**CRITICAL QUALITY PROTOCOL**
- ALL testing, linting, and formatting commands MUST NOT have ANY errors or warnings
- Unit tests run fast and validate logic with mocked I/O operations
- Integration tests run slower and validate real system interactions
- BUILD & ASSESS stage cannot be marked complete until ALL quality validation passes cleanly

### Branch and Commit Workflow
```bash
# Story setup (once per work item):
cp docs/template.md docs/XXX-work-item-name.md
# Fill in story details and Given-When-Then acceptance criteria

# End of PLAN stage:
git checkout -b feature/work-item-name
git add docs/XXX-work-item-name.md
git commit -m "plan: add work item XXX planning document

Initial planning for [work item description]

# Task iteration (repeat for each Given-When-Then):
# Stage 1: PLAN - Update story file with test strategy and file changes
# Stage 2: BUILD & ASSESS - Implement and validate until all quality passes
# Stage 3: REFLECT & ADAPT - Document process assessment and future task review
# Stage 4: COMMIT & PICK NEXT - Commit and select next task

git add .
git commit -m "feat: implement [task description]

[Optional body describing the Given-When-Then behavior implemented]
```

## Current Status

### Active Work Item
- **Work Item File**: [docs/001-feature-flags.md](../docs/001-feature-flags.md)
- **Current Task**: Criteria 1: Feature Flag Domain Model and API Contract
- **Current Stage**: BUILD & ASSESS 🔄 In Progress
- **Plan Documents** (kept until the work item completes):
  - [docs/plans/2026-04-30-feature-flags-design.md](../docs/plans/2026-04-30-feature-flags-design.md)
  - [docs/plans/2026-04-30-feature-flags.md](../docs/plans/2026-04-30-feature-flags.md)
- **Last Updated**: 2026-05-07

### When Active
When working on a story, this section will show:
- **Work Item File**: `docs/XXX-story-name.md` (link to active working document)
- **Current Task**: Task number and brief description from acceptance criteria
- **Current Stage**: PLAN / BUILD & ASSESS / REFLECT & ADAPT / COMMIT & PICK NEXT
- **Last Updated**: YYYY-MM-DD

*All detailed tracking lives in the individual work item file. This status section only provides lightweight pointers.*
