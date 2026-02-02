<#
.SYNOPSIS
Uninstall the FlowForge Codex skill from the current user's Codex skills folder.

.DESCRIPTION
Removes `~/.codex/skills/flowforge/`.

Note: Some environments block running PowerShell scripts. If needed, run with:
  powershell.exe -ExecutionPolicy Bypass -File scripts/uninstall-codex-skill.ps1
#>

$ErrorActionPreference = "Stop"

$destRoot = Join-Path $env:USERPROFILE ".codex/skills"
$dest = Join-Path $destRoot "flowforge"

if (!(Test-Path -LiteralPath $dest)) {
  Write-Host "Nothing to uninstall. Skill not found at: $dest"
  exit 0
}

Remove-Item -LiteralPath $dest -Recurse -Force
Write-Host "Uninstalled Codex skill 'flowforge' from: $dest"

