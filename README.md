# agent-skills

自作・改変済みのエージェント用スキル（`SKILL.md` 形式）の配布用リポジトリ。
Claude Code / Codex / Antigravity など、[Agent Skills](https://agentskills.io) 形式を読むツールで共通に使う。

## 収録スキル

| スキル | 何をするか | 由来・ライセンス |
|---|---|---|
| `skills/natural-japanese` | 仕事の日本語文書を読みやすく・AI臭くなく書く/直す。禁止語・翻訳調・リズムの機械lint（`scripts/lint.py`）＋文体憲法 | 自作（© Takashi Fujii） |
| `skills/magi` | 重い判断を3基「カガミ・タマ・ツルギ」の独立合議でレビューする。不一致は丸めない | 自作（© Takashi Fujii） |
| `skills/first-reader` | 公開前の原稿を読者2人＋スキマーが一段落ずつ読み、離脱点・翌日残るものを報告する。書き直さない | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/first-reader) 由来・Apache-2.0。**日本語パッチ済み**（上流は空白区切りで語数を数えるため日本語原稿が1チャンクになる。差分は `skills/first-reader/PATCH_NOTES.md`） |

## インストール

[skills CLI](https://skills.sh) で、使うエージェントを指定してグローバルに入れる:

```bash
# 3つまとめて
npx skills add 01st-memo/agent-skills -g -a claude-code codex antigravity -s '*' -y

# 1つだけ
npx skills add 01st-memo/agent-skills -g -a claude-code codex antigravity -s first-reader -y
```

手で入れるなら `skills/<name>/` をそのままエージェントのスキル置き場にコピーする
（Claude Code: `~/.claude/skills/`、Codex: `~/.codex/skills/`、Antigravity: `~/.gemini/antigravity/skills/`）。

### 動作に必要なもの

- **Python 3.10+**。Windows では環境変数 **`PYTHONUTF8=1`** を必ず設定する（cp932 で first-reader / lint の出力が壊れる）
- **natural-japanese の lint**: [uv](https://docs.astral.sh/uv/)（`uv run scripts/lint.py` が sudachipy / sudachidict-core をスクリプト内宣言から自動解決する）。`scripts/semantic.py` は torch 依存の opt-in なので通常は不要
- **first-reader**: 標準ライブラリのみ。オフライン動作・外部送信なし
- **magi**: サブエージェントを並列起動できるエージェント（Claude Code の Agent ツール等）

### よく一緒に使うもの（このリポには入れていない）

- スライド: [carnot-tech/consulting-pptx-skill](https://github.com/carnot-tech/consulting-pptx-skill)（MIT・改変なしで使うため上流から直接入れる）
  `npx skills add carnot-tech/consulting-pptx-skill -g -a claude-code codex antigravity -y`

## 更新のしかた（自分用）

正本は個人PCの `~/.claude/skills/` 側。編集したら `sync-from-local.ps1` でこのリポへミラーして commit / push し、
別PCでは `npx skills update` で取り込む。

## ライセンス

- `skills/first-reader`: Apache-2.0（同梱の `LICENSE` は上流のもの。改変内容は `PATCH_NOTES.md` に記載）
- `skills/magi`, `skills/natural-japanese`: © Takashi Fujii. 閲覧・個人利用は自由。再配布・改変配布は要相談
