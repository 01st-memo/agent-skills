# first-reader — local install notes

- **Source:** https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/first-reader
- **Pinned commit:** f163bb5a92111cee4610ac98e5dce4c6a2a09c26 (2026-09-15). Skill authored 2026-09-10 by Shubham Saboo; one external fix (HTML escape of verdict text).
- **License:** Apache-2.0 (upstream LICENSE applies).
- **Installed:** 2026-09-17 by fixed copy (no `npx skills add`, no auto-follow). Re-audit before pulling any upstream change.
- **Audit (2026-09-17):** full read of SKILL.md, 4 references, 7 scripts. stdlib only; `feed.py` binds 127.0.0.1 with `secrets` tokens; writes only under the run dir; no subprocess; no telemetry. Only outbound reference: Google Fonts `<link>` in `room_template.html` (fonts only, no draft content). Upstream self-tests pass on Windows under `PYTHONUTF8=1`.

## Local JP patch (applied to scripts/, not upstream)

Why: upstream counts words with `str.split()` and ends sentences on `[.!?]`. Japanese has no spaces and ends on `。！？`, so a 783-char/11-paragraph draft became ONE chunk (no-lookahead nullified) and `skim.py` printed the full text (skim gate = full read).

Changes (marked `# --- JP patch` in each file):
- `feed.py`: `wc()` word-equivalents (whitespace tokens + CJK chars ÷ 2); `SENT_END` adds `。！？`; oversized multi-line blocks (bullet lists, tables) split line-whole (`_split_lines`) before sentence-splitting (`_split_sentences`); CJK beats joined without spaces.
- `skim.py`: CJK paragraphs truncate to 18 chars; number regex uses ASCII boundaries (Python `\w` matches kanji); phone-screen estimate uses 20 chars/line for CJK.
- `room.py`: number highlighting uses ASCII boundaries (otherwise whole kanji runs were marked as numbers); sentence-end regexes add `。！？`.
- `room_template.html`: default `lang` = `ja`.
- `signals.py`: unpatched (English-only by design) — skipped for Japanese drafts.

Verified 2026-09-17: upstream `test_first_reader.py` all pass with the patch; Japanese sample → 4 chunks / dwell floor 9s; real 5,348-char note draft → 22 chunks, bullet lists preserved.
