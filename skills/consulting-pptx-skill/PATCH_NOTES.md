# PATCH_NOTES — 上流からの差分（01st-memo/agent-skills 配布版）

上流：[carnot-tech/consulting-pptx-skill](https://github.com/carnot-tech/consulting-pptx-skill)（MIT・© 2026 Carnot AI Inc.）コミット `e77416c` 時点。
上流のファイルは **SKILL.md の2か所以外は書き換えていない**。上流を更新するときは、上流を取り込んだうえで下の追記を当て直す。

| 種類 | ファイル | 内容 |
| --- | --- | --- |
| 追加 | `references/local-additions.md` | slide-rules.md に無く、相反しない規約 A1〜A11（タイトルの逆テスト・句点で二段にしない・判断語、線と塗りの意味の固定、比較で位置を動かさない、グラフの作法、円グラフ原則不使用、3つ目の軸を持ち込まない、優先度バブル）。食い違えば slide-rules.md が勝つ |
| 追加 | `references/chart-name-index.md` | やりたいこと8つ×図の名前5つ＝40個の索引。使いどころ・近い型（b/m 番号）・動く資料にするときの操作つき |
| 追加 | `PATCH_NOTES.md` | このファイル |
| 変更 | `SKILL.md` | 「ファイルと読むタイミング」表に上の2ファイルを追加。手順2に索引と interactive-deck への案内を1文追加 |

playwright（`npm run setup`）は interactive-deck の点検（`scripts/check.mjs`）でも共用する。
