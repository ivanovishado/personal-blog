# Cutting Claude Code's Initial Context Load by ~60%

What actually loads into Claude Code's context before you type your first message, and how I trimmed it from ~30k tokens to ~12k.

## The Problem

Every Claude Code session in my project started with ~30k tokens of context before any interaction. That's tokens burned on system instructions, not on my actual work.

## What Gets Loaded at Session Start

| Source | Approx. Weight | Description |
|--------|---------------|-------------|
| AGENTS.md (via CLAUDE.md `@` include) | ~40% | Was 592 lines — project overview, architecture, conventions, 60+ skill tables, hooks, MCP docs, troubleshooting, Paperclip integration |
| Skills list | ~20% | Each installed skill adds a name + trigger description to the system prompt. Had 57 project skills + ~15 from plugins |
| Base system prompt | ~15% | Claude Code's core instructions (tool usage, git protocols, coding guidelines) |
| Tool schemas | ~10% | Full JSON schemas for 9 built-in tools |
| Deferred tools + MCP instructions | ~8% | ~40+ tool names from MCP servers, Context7 usage instructions |
| Git status + memory + date | ~7% | Repo state snapshot, auto-memory index |

## What I Changed

### 1. AGENTS.md: 592 → 213 lines (always-loaded context)

Converted from a monolith to a lean index. Kept only what's needed for every session:

- Project overview, tech stack, directory map
- Code conventions (rules agents must always follow)
- Build commands (with `make dev` as preferred)
- Key files reference table
- Quality gates + definition of done
- One-line pointers to detail files

Extracted to `docs/agents/` (read on demand):
- `architecture.md` — auth, payments, KYC, email patterns
- `dev-setup.md` — environment setup, test accounts
- `hooks.md` — hook event → script mapping
- `mcp-servers.md` — Context7, Prisma-Local, shadcn, Stitch usage
- `subagent-delegation.md` — skill loading, workflow chains
- `troubleshooting.md` — common issues and fixes
- `paperclip.md` — Paperclip orchestration (only needed under Paperclip)
- `maintenance.md` — how to update AGENTS.md and detail files

**Removed entirely:** Skill Intent Table (65 lines) and Skills by Category (95 lines) — both were redundant with the skills list already injected into the system prompt by Claude Code itself. Paying for the same information twice.

### 2. Skills: 57 → 10 permanent project installs

Most of the 57 skills (marketing, SEO, CRO, secondary auth/prisma variants) were used in <5% of sessions but contributed their trigger descriptions to every session's context.

**Permanent skills (always installed):**
- `better-auth-best-practices`, `calmafiscal-copy`, `design-taste-frontend`, `find-skills`
- `javascript-testing-patterns`, `next-best-practices`, `prisma-cli`, `prisma-client-api`
- `shadcn`, `vercel-react-best-practices`

**Everything else:** installed on demand via `find-skills`, cleaned up at session end.

#### Dynamic Skill Loading Workflow

1. Agent checks installed skills
2. If task needs a skill not in the permanent set → uses `find-skills` to discover → installs with `npx skills add <owner/repo> -s <skill> -a claude-code -y` (project level only, never `-g`)
3. Registers the install in `.agents/dynamic-skills.md` (coordination file for parallel agents)
4. Uses the skill normally
5. `SessionEnd` hook automatically removes any skill not in the baseline list

The `SessionEnd` hook is key — it fires once when the session terminates (not after every response like `Stop`), and only for the main session (not subagents). It diffs installed skills against a baseline list and removes extras, skipping any skill registered by another active parallel session.

#### File structure

- `.agents/skills/` — source of truth for all skill files
- `.claude/skills/` — symlinks to `.agents/skills/` (Claude Code reads from here)
- `.agents/dynamic-skills.md` — baseline list + active dynamic skills table
- `.claude/dynamic-skills.md` — symlink to above

### 3. User-Level Hooks Cleanup

Found duplicate hook configurations between user-level (`~/.claude/settings.json`) and project-level (`.claude/settings.json`):

- `enforce-opus-on-dev-agents.sh` — exists at both levels, user-level is intentional (applies to all projects)
- `intercept-plan-agent.sh` — same, intentional at user level
- `suggest-lsp.sh` — was at user level pointing to a real file, but project level already covers it. Removed the user-level hook entry and the script.

### 4. Plugins Contributing Context

User-level plugins each add skills and hook outputs to the system prompt:

| Plugin | What it adds |
|--------|-------------|
| `explanatory-output-style` | SessionStart hook with output format instructions |
| `hookify` | ~5 skills + a conversation-analyzer agent type |
| `skill-creator` | 1 skill |
| `claude-code-setup` | 1 skill |
| `claude-md-management` (project) | 2 skills |
| `typescript-lsp` | LSP tool definition |

Each plugin is a small tax. Disabling unused ones (hookify, skill-creator, etc.) would save more tokens.

### 5. AGENTS.md Hooks Table Was Outdated

The hooks reference listed `session-init.sh` (SessionStart) and `skills-reminder.sh` (UserPromptSubmit, SubagentStart) — neither was actually configured in settings.json. They were phantoms from a previous iteration. Updated the table to match reality and added missing hooks (`enforce-stitch-pro.sh`, `track-modified-files.sh`, `agents-md-check.sh`).

## Key Takeaways

- **Audit what's always loaded.** CLAUDE.md `@` includes inline everything. If your AGENTS.md is 600 lines, that's 600 lines in every session's context.
- **Skills are not free.** Each installed skill adds its name + trigger description to the prompt. 57 skills × ~50 tokens each ≈ 2,800 tokens just for the skills list.
- **Don't document what the system already provides.** My skill intent tables duplicated what the skills system prompt already contained.
- **Use the index pattern.** Keep a lean always-loaded index with pointers to detail files that are read on demand. Same pattern as how the skills list works — names in memory, full instructions fetched when invoked.
- **`SessionEnd` > `Stop` for cleanup.** `Stop` fires after every response. `SessionEnd` fires once when the session truly ends. Use the right lifecycle event.
- **Check for duplicate hooks.** User-level and project-level settings can both configure hooks for the same events, pointing to different (or non-existent) scripts.
