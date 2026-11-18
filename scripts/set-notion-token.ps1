<#
.SYNOPSIS
  Menulis NOTION_TOKEN ke .env tanpa membuka editor (input tersembunyi).

.DESCRIPTION
  Menghindari kesalahan umum: kutip ikut tersimpan, spasi di belakang nilai,
  file tersimpan dengan nama/encoding lain, atau paste yang tidak ter-save.
  Script ini hanya mengubah baris NOTION_TOKEN, baris lain tidak disentuh.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\set-notion-token.ps1

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\set-notion-token.ps1 -Token ntn_xxxxxxxx
#>
param(
  [string]$Token,
  [string]$EnvPath
)

$ErrorActionPreference = 'Stop'

if (-not $EnvPath) { $EnvPath = Join-Path (Split-Path -Parent $PSScriptRoot) '.env' }
$EnvPath = [System.IO.Path]::GetFullPath($EnvPath)
if (-not (Test-Path -LiteralPath $EnvPath)) { throw ".env tidak ditemukan: $EnvPath" }

if (-not $PSBoundParameters.ContainsKey('Token')) {
  Write-Host 'Tempel Notion Internal Integration Secret, lalu tekan Enter (input disembunyikan):'
  $secure = Read-Host -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { $Token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

$Token = ($Token -replace '\s', '').Trim('"').Trim("'").Trim()

if (-not $Token) { throw 'Token kosong. Tidak ada perubahan.' }
if ($Token -notmatch '^(ntn_|secret_)') { Write-Warning "Prefix token tidak dikenal: $($Token.Substring(0, [Math]::Min(4, $Token.Length)))" }

$lines = [System.IO.File]::ReadAllLines($EnvPath)
$found = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '^\s*NOTION_TOKEN\s*=') {
    $lines[$i] = "NOTION_TOKEN=$Token"
    $found = $true
  }
}
if (-not $found) { $lines += "NOTION_TOKEN=$Token" }

[System.IO.File]::WriteAllLines($EnvPath, $lines, (New-Object System.Text.UTF8Encoding($false)))

$saved = [System.IO.File]::ReadAllLines($EnvPath) | Where-Object { $_ -match '^NOTION_TOKEN=' } | Select-Object -First 1
$value = ($saved -split '=', 2)[1]
Write-Host ("OK: NOTION_TOKEN tersimpan di {0}" -f $EnvPath)
Write-Host ("    panjang {0} karakter, prefix {1}..." -f $value.Length, $value.Substring(0, [Math]::Min(6, $value.Length)))
Write-Host 'Langkah berikutnya: npm.cmd run sync:notion:check'
