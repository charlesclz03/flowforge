<#
.SYNOPSIS
Install the FlowForge Codex skill into the current user's Codex skills folder.

.DESCRIPTION
Copies `tools/codex/skills/flowforge/` to `~/.codex/skills/flowforge/`.

Note: Some environments block running PowerShell scripts. If needed, run with:
  powershell.exe -ExecutionPolicy Bypass -File scripts/install-codex-skill.ps1
#>

param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $repoRoot "tools/codex/skills/flowforge"

if (!(Test-Path -LiteralPath $source)) {
  throw "Source skill folder not found: $source"
}

$destRoot = Join-Path $env:USERPROFILE ".codex/skills"
$dest = Join-Path $destRoot "flowforge"

if (Test-Path -LiteralPath $dest) {
  if (-not $Force) {
    throw "Destination already exists: $dest. Re-run with -Force to overwrite."
  }
  Remove-Item -LiteralPath $dest -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $destRoot | Out-Null
Copy-Item -LiteralPath $source -Destination $destRoot -Recurse -Force

Write-Host "Installed Codex skill 'flowforge' to: $dest"
Write-Host "Restart Codex to pick up new skills."

