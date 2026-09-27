# agent-skills

自作・改変済みのエージェント用スキル（`SKILL.md` 形式）の配布用リポジトリ。
Claude Code / Codex / Antigravity など、[Agent Skills](https://agentskills.io) 形式を読むツールで共通に使う。

## 収録スキル

| スキル | 何をするか | 由来・ライセンス |
|---|---|---|
| `skills/natural-japanese` | 仕事の日本語文書を読みやすく・AI臭くなく書く/直す。禁止語・翻訳調・リズムの機械lint（`scripts/lint.py`）＋文体憲法 | 自作（© Takashi Fujii） |
| `skills/magi` | 重い判断を3基「カガミ・タマ・ツルギ」の独立合議でレビューする。不一致は丸めない | 自作（© Takashi Fujii） |
| `skills/consulting-pptx-skill` | 経営会議品質のスライド（HTML→PDF）。規約 slide-rules.md＋62型パーツ集＋機械チェック。**自作追記**＝`references/local-additions.md`（相反しない規約 A1〜A11）と `references/chart-name-index.md`（やりたいこと→図の名前40個→型→動かすなら） | [carnot-tech/consulting-pptx-skill](https://github.com/carnot-tech/consulting-pptx-skill) 由来・MIT（© Carnot AI Inc.）。上流ファイルは SKILL.md の案内2か所以外は無改変。差分は `skills/consulting-pptx-skill/PATCH_NOTES.md` |
| `skills/interactive-deck` | 画面で見せる資料を「押すと根拠が開く・動かすと計算し直す」1ファイルのHTMLにする。見出しの構造から操作を1つ引く。動く見本と点検（`scripts/check.mjs`）つき。中身の規律は consulting-pptx-skill に従うので一緒に入れる | 自作（© Takashi Fujii）。考え方の出典はうちた氏の note（SKILL.md 末尾に明記） |
| `skills/first-reader` | 公開前の原稿を読者2人＋スキマーが一段落ずつ読み、離脱点・翌日残るものを報告する。書き直さない | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/first-reader) 由来・Apache-2.0。**日本語パッチ済み**（上流は空白区切りで語数を数えるため日本語原稿が1チャンクになる。差分は `skills/first-reader/PATCH_NOTES.md`） |

## インストール

[skills CLI](https://skills.sh) で、使うエージェントを指定してグローバルに入れる:

```bash
# 全部まとめて
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
- **consulting-pptx-skill / interactive-deck**: Python 3（check_deck.py）と Node.js。実レンダリングの点検には playwright が要る＝入れた先の `consulting-pptx-skill` フォルダで `npm run setup` を1回（interactive-deck の `scripts/check.mjs` も同じものを使う。別の場所なら `PLAYWRIGHT_MODULE_DIR` で node_modules を指す）

### 上流版の consulting-pptx-skill を入れている場合

以前 `carnot-tech/consulting-pptx-skill` から直接入れた環境は、このリポの版で上書きしてよい（同じ名前・上流ファイルは同一・追記ファイルが増えるだけ）。
```bash
npx skills add 01st-memo/agent-skills -g -a claude-code codex antigravity -s consulting-pptx-skill -y
npx skills add 01st-memo/agent-skills -g -a claude-code codex antigravity -s interactive-deck -y
```

## 更新のしかた（自分用）

正本は個人PCの `~/.claude/skills/` 側。編集したら `sync-from-local.ps1` でこのリポへミラーして commit / push し、
別PCでは `npx skills update` で取り込む。

## ライセンス

- `skills/consulting-pptx-skill`: MIT（同梱の `LICENSE` は上流のもの。追記内容は `PATCH_NOTES.md` に記載）
- `skills/interactive-deck`: © Takashi Fujii. 閲覧・個人利用は自由。再配布・改変配布は要相談
- `skills/first-reader`: Apache-2.0（同梱の `LICENSE` は上流のもの。改変内容は `PATCH_NOTES.md` に記載）
- `skills/magi`, `skills/natural-japanese`: © Takashi Fujii. 閲覧・個人利用は自由。再配布・改変配布は要相談
