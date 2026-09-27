# ~/.claude/skills/ の正本を、このリポの skills/ へミラーする（自分用）
# 使い方: このフォルダで  .\sync-from-local.ps1  → git diff で確認 → commit / push
$src = Join-Path $env:USERPROFILE ".claude\skills"
$dst = Join-Path $PSScriptRoot "skills"
foreach ($s in @('first-reader', 'magi', 'natural-japanese', 'interactive-deck', 'consulting-pptx-skill')) {
    robocopy (Join-Path $src $s) (Join-Path $dst $s) /MIR /XD __pycache__ .git .first-reader node_modules check_out /XF *.pyc /NFL /NDL /NJH /NJS /NP | Out-Null
    # robocopy は 0-7 が正常（1 = コピーあり）
    if ($LASTEXITCODE -ge 8) { Write-Error "robocopy failed for $s (exit $LASTEXITCODE)"; exit 1 }
    Write-Host "synced: $s"
}
Write-Host "done. run: git status / git diff"
