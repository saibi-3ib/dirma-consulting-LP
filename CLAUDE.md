# CLAUDE.md - Project Context & AI Agent Guidelines

## 1. Project Overview
**Med-Ai Landing & Marketing Hub** is the public-facing web property for **ダーマコンサル (Derma Consul)** — an online dermatology consulting service operated by **株式会社Med-Ai**. This repository starts as a simple landing page with a contact form and grows over time into the company's owned-media platform (blog / case studies / SEO content).

- **Production domain:** medai.jp
- **Current scope:** Marketing & lead capture for Derma Consul.
- **Future scope:** Owned-media (articles, case studies, recruiting pages), full-funnel marketing site for Med-Ai's product line.
- This repository consolidates ALL customer-acquisition / marketing code so that growth experiments don't fragment across multiple repos.

## 2. Current Architecture (Snapshot)

The current state is intentionally minimal — a quick first cut to validate the message and collect early inquiries.

- **Static HTML pages (no build step):**
    - `LP.html`     — Main landing page (desktop)
    - `sp.html`     — Smartphone-optimized variant
    - `teaser.html` — Pre-launch teaser
- **Assets:** `resource/` (images, CSS, JS)
- **Form submission:** Direct SMTP from the page (no backend integration yet)
- **Hosting:** AWS Bitnami instance, co-located with the Derma Consul backend (`saibi-3ib/derma-consulting-backend`)

This setup works but has obvious limits: HTML duplication across PC/SP/teaser, no spam protection on the form, and no path for adding article content.

## 3. Improvement Roadmap (Decisions Pending)

These are documented for context. **Do not implement without explicit user approval.** The user may pick and choose; sequence and scope are negotiable.

### 3.1 Short-term (1〜2 weeks)
- **Consolidate HTML duplication** with a lightweight static site generator. Astro (preferred), Eleventy, or Hugo. Wrap the existing HTML in shared `<Layout>` components for header / footer / meta tags.
- **Replace SMTP form submission** with a POST to the Derma Consul backend's UVdesk ticket endpoint. Inquiries should land in UVdesk alongside consultation tickets so support workflow is unified.

### 3.2 Mid-term (1〜3 months)
- **Owned-media platform** decision:
    - Option A: WordPress (PHP/MySQL) — strong author UX, large plugin ecosystem, higher ops burden.
    - Option B: Astro + headless CMS (microCMS / Contentful) — Markdown-based, fast static delivery, can share repo with the LP. Recommended.
- **Hosting** migration: move static parts to Cloudflare Pages (free CDN, edge caching). Keep Bitnami exclusively for the dc backend.

### 3.3 Long-term
- Marketing automation integration (HubSpot, Brevo, etc.)
- Analytics foundation (GA4 + Looker Studio)

## 4. UI/UX Principles

- **Audience:** primarily medical professionals (general practitioners, dermatologists). Secondary: hospital administration / payers.
- **Mobile-first:** doctors browse from smartphones during clinical breaks. SP variant must be visually equivalent in information density to PC.
- **Trust signals matter:** clear company information (Med-Ai legal entity, founders, advisors), references, security/privacy disclosures.
- **Form inputs are kept minimal.** Required: name, organization, email, brief inquiry. No optional fields by default.

## 5. Directory Structure

```
.
├── LP.html       # Main landing (PC)
├── sp.html       # Smartphone variant
├── teaser.html   # Pre-launch teaser
├── resource/     # Images, CSS, JS, fonts
├── README.md
└── .github/      # GitHub workflow placeholders
```

This structure will evolve once a static site generator is introduced. When refactoring, **preserve the existing HTML output paths** so any inbound links from ads / SEO / printed materials remain valid (set up redirects if paths must change).

## 6. Forbidden / Sensitive Areas

- **SMTP credentials, API keys, and form destination emails MUST NOT be committed to the repository.** Use environment variables or a deployment-time secret store.
- **Inbound inquiry data is potentially sensitive** (clinic names, individual doctors' contact info). Until UVdesk integration lands, server-side handling of form submissions must mask or limit logging.
- **Brand and design assets** in `resource/` may be subject to brand-guideline review; substantive visual changes require human approval before deployment.

## 7. Guidelines for AI Agents

- **Cross-device parity:** any layout / copy change to `LP.html` must be replicated in `sp.html` (and vice versa) unless the change is intentionally device-specific.
- **Don't break printed-material URLs:** the live site is referenced from business cards, slide decks, and ads. Redirects are mandatory if you change paths.
- **Form integrity:** do not weaken or remove client-side validation. Treat the form as the primary lead-capture funnel.
- **SEO / OGP:** preserve and improve `<title>`, `<meta description>`, `<meta og:*>` tags. Coordinate copy with stakeholders before substantive rewrites.
- **Performance budget:** Lighthouse Performance ≥ 85 on mobile. Avoid heavy bundles or render-blocking scripts.

## 8. Branch & PR Workflow (MANDATORY)

These rules apply to ALL changes initiated by Claude Code, **even single-line edits**. There are no "too small to bother" exceptions.

### 8.1 Branch Strategy
- `main` is protected. Direct commits or pushes to `main` are FORBIDDEN.
- All Claude Code work must happen on a feature branch named `feat/claude/<topic>`.
  - Examples: `feat/claude/add-pagination`, `feat/claude/fix-auth-redirect`, `feat/claude/add-readme-tagline`
- `<topic>` must reflect the current task, not a leftover topic from an earlier branch.
- At the start of every session, run `git status` and `git branch --show-current`.
  - If on `main`: create a new branch immediately, before any edit.
  - If on an existing `feat/claude/*` branch:
    - If that branch already has an open or merged PR → **create a new branch** for the current task.
    - If the existing branch's topic clearly differs from the new task → **create a new branch**.
    - If continuing the exact same topic with no PR yet → stay on the current branch.
  - When in doubt, prefer a new branch. Small, focused PRs are easier to review than mixed-topic ones.

### 8.2 Commit / Push / PR Flow (MANDATORY — Execute, do not just propose)

When the user-requested work is functionally complete (the change does what the user asked), Claude Code MUST execute the following steps **itself**, without waiting for further instruction:

1. Review the changes:
   ```
   git status
   git diff --stat
   git diff
   ```
2. Stage the relevant files explicitly (avoid `git add -A` to prevent accidental inclusion):
   ```
   git add <file1> <file2> ...
   ```
3. Commit with a Conventional Commits message (see §10.1):
   ```
   git commit -m "<type>: <short imperative description>"
   ```
4. Push the feature branch:
   ```
   git push -u origin feat/claude/<topic>
   ```
5. Create the Pull Request via GitHub CLI:
   ```
   gh pr create --base main --head feat/claude/<topic> --title "<title>" --body "<body>"
   ```
6. Display the resulting PR URL in chat for the user to review.

**Important:** "propose" in this section means "execute the commands yourself and report the result", not "show the user the commands and wait". The user reviews and merges the PR via the GitHub UI. Claude MUST NOT merge.

For multi-stage tasks where intermediate commits make sense, ask the user "ここまでで一旦コミットしますか？" before each commit, but still execute the full push/PR flow when the unit is complete.

If any step fails (e.g., `gh pr create` returns an authentication or merge-conflict error), surface the error verbatim and ask the user how to proceed before retrying.

## 9. Production Coexistence Safety Rules

This site is **already published at medai.jp** and referenced from external materials.

- Public URLs (file paths, anchor IDs cited in marketing copy) must remain stable. Use redirects when restructuring.
- Form submission behavior is observed in production. Do not silently change validation, success-page paths, or destination addresses.
- The teaser page may have campaign-specific tracking parameters — preserve them when refactoring.

## 10. Commit & Coding Conventions

### 10.1 Commits
- Follow Conventional Commits prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `style:`
- Subject in English (under 72 chars). Body may be Japanese.
- One logical unit per commit.

### 10.2 HTML / CSS / JS
- Indentation: 2 spaces.
- Semantic HTML5 (use `<main>`, `<section>`, `<article>`, `<nav>`, etc.).
- CSS: prefer custom properties for colors / spacing tokens. Avoid `!important`.
- JS: vanilla ES2020+ until a framework is introduced. No jQuery for new code.

### 10.3 Accessibility
- All images: meaningful `alt` text or `alt=""` for decorative.
- Form fields: associated `<label>` (or `aria-label`).
- Color contrast: WCAG AA minimum.

## 11. Forbidden Operations

Claude Code MUST NOT:
- Commit `.env`, SMTP credentials, API keys, or any secret material.
- Push to or modify the `main` branch directly.
- Change the production form's destination address without explicit user approval.
- Remove or weaken client-side validation in the contact form.
- Inline analytics or tracking IDs that haven't been pre-approved.
- Add third-party fonts/scripts without performance and privacy review.

## 12. Session Startup Checklist

At the start of every session in this repository, Claude Code must:

1. Run:
   ```
   git status
   git branch --show-current
   ```
2. If the current branch is `main`, create a new feature branch (`feat/claude/<topic>`) before any edit.
3. Skim the most recent files in `docs/ai_contexts/` (if present) for context from prior sessions.
4. Confirm the user's stated task is consistent with §8〜§11. If a conflict exists, surface it BEFORE acting.

## 13. Inheriting Context from Prior LLM Sessions

This repository may be edited by Claude Code, Gemini, or other LLM tools across time, with imperfect coordination.

- §1〜§7 of this file is a **starting hypothesis**, not ground truth. The actual files (`LP.html`, `sp.html`, `teaser.html`, `resource/`) are authoritative.
- At session start, after `git status`, skim the modified-recently HTML and assets to ground yourself in the current state.
- When you find a clear discrepancy between this CLAUDE.md and the actual code (e.g., a section that no longer exists, a path that has moved), **propose a CLAUDE.md update** as part of your next commit on the current feature branch. Do not silently work around inconsistencies.
- The `session-archivist` subagent log written by `/eod` is the canonical record going forward. CLAUDE.md should be kept in sync with it.

## 14. End-of-Session Behavior

When the user shows signs of wrapping up the day's session (e.g., says "終わります", "今日はここまで", "good night", "thanks, that's all", or signs off after substantive work without invoking `/eod`), Claude Code should proactively offer:

> 今日のセッションログを `/eod` で記録しますか？

- If the user agrees, invoke `/eod`.
- If the user declines or stays silent, do not push further within the same session.
- Skip this prompt entirely when the session was trivial (no commits, no edits, just a quick Q&A).

This is a courtesy reminder, not enforcement. The user retains final authority over whether to log.
