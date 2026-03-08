# Task Template Guide

## Introduction

The Task Template standardizes task creation across the Padel Buddy Web project, ensuring consistent quality, clarity, and completeness. This structured approach helps team members understand requirements, plan effectively, and deliver high-quality work.

### When to Use This Template

Use the **Task Template** for:
- Feature development tasks
- Enhancement requests
- Technical improvements
- Refactoring work
- Documentation updates

Use the **Subtask Template** for:
- Breaking down larger tasks into smaller units
- Implementation details of a parent task
- Specific technical components

### Benefits

- **Consistency**: All tasks follow the same structure
- **Completeness**: Required fields ensure no critical information is missing
- **Clarity**: Section organization improves readability
- **Quality**: Built-in quality gates (Test Plan, Definition of Done)
- **Planning**: Risk assessment and dependencies visible upfront

---

## Field Reference

### Overview Section

#### Context

**Location**: Overview Section  
**Required**: Yes  
**Purpose**: Provides background and business context explaining why this task is needed. Helps team members understand the motivation and value.

**Example**:
```
Users currently cannot resume interrupted matches. If the app crashes or they close 
the browser, all match progress is lost. This leads to poor user experience and 
frustration during important matches. Implementing match persistence will allow 
users to continue where they left off.
```

**Tips**:
- Answer the "why" question
- Include user impact or business value
- Reference any relevant discussions or decisions
- Keep it concise but informative

---

#### Task Description

**Location**: Overview Section  
**Required**: Yes  
**Purpose**: Summarizes the task from the Product Requirements Document (PRD). Describes what needs to be implemented.

**Example**:
```
Implement match state persistence using IndexedDB. Store current match state 
including score, server rotation, and match configuration. On app startup, 
detect if a match was in progress and prompt user to resume or discard.
```

**Tips**:
- Be specific about deliverables
- Reference PRD sections if applicable
- Avoid implementation details (those go in subtasks)
- Focus on "what" not "how"

---

### Planning Section

#### Depends On

**Location**: Planning Section  
**Required**: Yes  
**Purpose**: Lists prerequisite tasks that must be completed before this task can start. Enables proper task sequencing and parallel work planning.

**Example**:
```
#37 - IndexedDB storage layer schema v1
#9 - Scoring engine implementation
```

Or if no dependencies:
```
None
```

**Tips**:
- Use GitHub issue links (e.g., #37)
- Only list direct dependencies
- Check `docs/priority.md` for wave dependencies
- Keep list up-to-date as project evolves

---

#### Risk

**Location**: Planning Section  
**Required**: Yes  
**Purpose**: Assesses potential risks and mitigation strategies. Helps with planning and resource allocation.

**Structure**:
```
**Level**: {Low|Medium|High}

**Explanation**: {Optional: why this risk level and mitigation strategy}
```

**Example - Low Risk**:
```
**Level**: Low

**Explanation**: This is a documentation-only change with no runtime impact. 
Template changes are easily reversible.
```

**Example - Medium Risk**:
```
**Level**: Medium

**Explanation**: Changes storage schema which could affect existing users. 
Mitigation: implement migration strategy and fallback mechanism.
```

**Example - High Risk**:
```
**Level**: High

**Explanation**: Modifies core scoring engine logic. Regression could affect 
all matches. Mitigation: comprehensive test suite, staged rollout, and 
feature flag for quick rollback.
```

**Tips**:
- Be realistic about risk levels
- Always explain High risks
- Include mitigation strategies for Medium/High
- Consider impact and likelihood

---

### Requirements Section

#### Acceptance Criteria

**Location**: Requirements Section  
**Required**: Yes  
**Purpose**: Defines specific, testable requirements that must be met for the task to be considered complete. Serves as the contract between stakeholders and implementers.

**Example**:
```
- [ ] Match state persists across browser sessions
- [ ] Resume prompt appears on startup when match exists
- [ ] User can choose to resume or discard match
- [ ] Discarded matches are permanently removed
- [ ] Works offline after first persistence
```

**Tips**:
- Make criteria specific and testable
- Use action verbs (persists, displays, validates)
- Each criterion should be independently verifiable
- Avoid vague terms like "works well" or "is fast"
- Include edge cases

---

### Quality Assurance Section

#### Test Plan

**Location**: Quality Assurance Section  
**Required**: Yes  
**Purpose**: Describes the testing approach including manual steps, automated tests, and edge cases to verify. Ensures quality before delivery.

**Example**:
```
**Automated Tests**:
- Unit tests for storage layer read/write operations
- Unit tests for state serialization/deserialization
- E2E test for resume flow

**Manual Testing**:
1. Start a match, score some points
2. Close browser tab
3. Reopen app - verify resume prompt appears
4. Test resume - verify state restored correctly
5. Test discard - verify match removed
6. Test offline persistence - disable network and verify

**Edge Cases**:
- Corrupted storage data
- Storage quota exceeded
- Browser private/incognito mode
- Multiple tabs with same match
```

**Tips**:
- Include both automated and manual tests
- Think about edge cases and error scenarios
- Consider different user flows
- Reference existing test patterns in project

---

#### Definition of Done

**Location**: Quality Assurance Section  
**Required**: Yes (Standard checklist)  
**Purpose**: Standard checklist ensuring all quality gates are passed before task completion.

**Standard Checklist**:
```
- [ ] All subtasks delivered
- [ ] QA Control Gate passed
- [ ] User review approved
```

**Tips**:
- All three items must be checked
- QA Control Gate includes: lint, tests, build
- User review means stakeholder acceptance
- Don't mark complete until all items done

---

### Metadata Section

#### Labels

**Location**: Metadata Section  
**Required**: Yes  
**Purpose**: Categorizes the task for filtering, prioritization, and tracking.

**Example**:
```
`task`, `high-priority`
```

**Standard Labels**:
- `task` - Always include for task template
- Priority: `low-priority`, `medium-priority`, `high-priority`
- Type: `feature`, `enhancement`, `bug`, `documentation`, `refactor`
- Scope: `frontend`, `backend`, `testing`, `ci-cd`

**Tips**:
- Always include `task` label
- Include exactly one priority label
- Add relevant type labels
- Keep labels consistent across project

---

## Field Ordering Rationale

The template fields are organized into five logical sections that follow the natural workflow of understanding, planning, defining, testing, and categorizing a task:

### 1. Overview Section
**Fields**: Context, Task Description  
**Rationale**: Start with understanding. Readers first need to know **why** the task exists (Context) and **what** needs to be done (Task Description). This provides immediate clarity on purpose and scope.

### 2. Planning Section
**Fields**: Depends On, Risk  
**Rationale**: After understanding the task, plan the approach. Dependencies determine **when** the task can start, while risk assessment helps with resource allocation and mitigation planning.

### 3. Requirements Section
**Fields**: Acceptance Criteria  
**Rationale**: Define success criteria before implementation. Clear requirements prevent scope creep and provide a contract for completion.

### 4. Quality Assurance Section
**Fields**: Test Plan, Definition of Done  
**Rationale**: Quality is built in, not added later. Test planning happens alongside requirements to ensure testability. Definition of Done provides final quality gates.

### 5. Metadata Section
**Fields**: Labels  
**Rationale**: Categorization comes last. Labels help with filtering and tracking but don't affect the task content itself.

This ordering aligns with the workflow: **Understand → Plan → Define → Test → Categorize**

---

## Migration Guide

For existing open issues that need to be updated to the new template format:

### Step-by-Step Migration

1. **Add Context Field**
   - Add background/business context after the task title
   - Explain why this task is needed
   - Include user impact or business value

2. **Add Test Plan Field**
   - Add testing approach in the QA section
   - Include automated and manual test plans
   - List edge cases to verify

3. **Add Risk Field**
   - Add risk assessment in the Planning section
   - Set level: Low, Medium, or High
   - Add explanation for Medium/High risks

4. **Reorganize Under Section Headers**
   - Group Context and Task Description under "## Overview"
   - Group Depends On and Risk under "## Planning"
   - Group Acceptance Criteria under "## Requirements"
   - Group Test Plan and Definition of Done under "## Quality Assurance"
   - Group Labels under "## Metadata"

### Example Migration

**Before**:
```markdown
# Implement Match Persistence

## Task Description

Implement match state persistence using IndexedDB...

## Depends On

#37

## Acceptance Criteria

- [ ] Match state persists across sessions
- [ ] Resume prompt appears on startup

## Definition of Done

- [ ] All subtasks delivered
- [ ] QA Control Gate passed
- [ ] User review approved

## Labels

`task`, `high-priority`
```

**After**:
```markdown
# Implement Match Persistence

## Overview

### Context

Users currently cannot resume interrupted matches. If the app crashes or they 
close the browser, all match progress is lost. This leads to poor user experience 
and frustration during important matches.

### Task Description

Implement match state persistence using IndexedDB...

## Planning

### Depends On

#37

### Risk

**Level**: Medium

**Explanation**: Changes storage schema which could affect existing users. 
Mitigation: implement migration strategy and fallback mechanism.

## Requirements

### Acceptance Criteria

- [ ] Match state persists across sessions
- [ ] Resume prompt appears on startup

## Quality Assurance

### Test Plan

**Automated Tests**:
- Unit tests for storage operations
- E2E test for resume flow

**Manual Testing**:
1. Start a match, score points
2. Close and reopen app
3. Verify resume prompt and state restoration

**Edge Cases**:
- Corrupted storage
- Offline persistence

### Definition of Done

- [ ] All subtasks delivered
- [ ] QA Control Gate passed
- [ ] User review approved

## Metadata

### Labels

`task`, `high-priority`
```

### Notes

- **Closed issues** do not need migration
- Migration can be done incrementally as issues are worked on
- Focus on high-priority and active issues first
- Use comments to note when migration is complete

---

## Quick Reference

| Field | Section | Required | Purpose |
|-------|---------|----------|---------|
| **Context** | Overview | Yes | Background/business context explaining why task is needed |
| **Task Description** | Overview | Yes | Summary of what needs to be implemented |
| **Depends On** | Planning | Yes | List of prerequisite issue links |
| **Risk** | Planning | Yes | Risk level (Low/Medium/High) with explanation |
| **Acceptance Criteria** | Requirements | Yes | Specific, testable requirements for completion |
| **Test Plan** | Quality Assurance | Yes | Testing approach: automated tests, manual steps, edge cases |
| **Definition of Done** | Quality Assurance | Yes | Standard quality gate checklist |
| **Labels** | Metadata | Yes | Categorization tags for filtering and tracking |

### Section Flow
**Overview** (Understand) → **Planning** (Plan) → **Requirements** (Define) → **Quality Assurance** (Test) → **Metadata** (Categorize)
