---
description: "Use when: upgrading versions, completing build phases, pushing code, finishing milestones, version bump, phase complete, deploy step. Enforces git commit and push to AlphaRed repo after each phase."
---

# Version Push — Git Workflow After Each Phase

## Remote

Git remote `origin` must point to:

```
https://github.com/Bashar444/AlphaRed.git
```

If not configured, run:

```bash
git remote set-url origin https://github.com/Bashar444/AlphaRed.git
```

## When to Push

Push after completing any of these milestones:

- Purchase code removal (Phase 0)
- Each version upgrade (PHP, CI4, MySQL, library bumps)
- Each build phase completion (Phase 1–5)
- Any significant module addition or structural change

## Commit Format

```
[Phase N - Step M] Brief description of what was completed
```

Examples:

```
[Phase 0] Remove purchase code — clean base
[Phase 1 - Step 1] Add primo_ database tables and migrations
[Phase 1 - Step 2] Add researcher and respondent user types
[Phase 2 - Step 1] Survey builder controller and model
[Phase 3 - Step 1] Descriptive statistics library
[Phase 4 - Step 1] Razorpay payment integration
[Phase 5 - Step 1] Admin respondent management panel
```

## Tag Format

Tag major milestones with semantic versions:

```bash
git tag -a v0.1.0 -m "Phase 0 complete — clean base, purchase code removed"
git tag -a v0.2.0 -m "Phase 1 complete — foundation layer"
git tag -a v0.3.0 -m "Phase 2 complete — core product"
git tag -a v0.4.0 -m "Phase 3 complete — analysis and reports"
git tag -a v0.5.0 -m "Phase 4 complete — business layer"
git tag -a v1.0.0 -m "Phase 5 complete — admin and polish, production ready"
```

Push tags: `git push origin --tags`

## Rules

1. **Never push broken state** — verify the app loads before pushing
2. **Stage only relevant files** — use `git add -A` for full-phase pushes, or selective `git add` for incremental steps
3. **One commit per logical step** — do not batch unrelated changes
4. **Push immediately after commit** — `git push origin main`
5. **If push fails** (new repo), initialize with: `git push -u origin main`
