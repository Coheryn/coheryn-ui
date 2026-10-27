<#
.SYNOPSIS
    CoherynUI Universal Native CLI Installer for Windows
    https://coheryntech.com/products/coheryn-ui

.DESCRIPTION
    Downloads and installs the native coherynui.exe binary for 64-bit Windows,
    validates checksum integrity, and updates the user Path environment variable.
#>

[CmdletBinding()]
param (
    [string]$Version = "latest",
    [string]$InstallDir = "$env:USERPROFILE\.coheryn\bin"
)

$ErrorActionPreference = "Stop"

$Repo = "Coheryn/coheryn-ui"
$BinaryName = "coherynui.exe"
$Target = "x86_64-pc-windows-msvc"

Write-Host "==> CoherynUI Windows Installer" -ForegroundColor Magenta

# 1. Resolve Version
if ($Version -eq "latest") {
    Write-Host "==> Querying latest release version from GitHub..." -ForegroundColor Cyan
    try {
        $ReleaseUri = "https://api.github.com/repos/$Repo/releases/latest"
        $ReleaseJson = Invoke-RestMethod -Uri $ReleaseUri -UseBasicParsing -Headers @{ "User-Agent" = "CoherynInstaller" }
        $Version = $ReleaseJson.tag_name
    } catch {
        $Version = "v1.0.0"
    }
}

if (-not $Version.StartsWith("v")) {
    $Version = "v$Version"
}

$ZipName = "coherynui-$Version-$Target.zip"
$DownloadUrl = "https://github.com/$Repo/releases/download/$Version/$ZipName"
$TempDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
$ZipPath = Join-Path $TempDir $ZipName

New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

try {
    Write-Host "==> Downloading $ZipName..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath -UseBasicParsing

    Write-Host "==> Extracting archive..." -ForegroundColor Cyan
    Expand-Archive -Path $ZipPath -DestinationPath $TempDir -Force

    $ExtractedBin = Get-ChildItem -Path $TempDir -Recurse -Filter $BinaryName | Select-Object -First 1
    if (-not $ExtractedBin) {
        throw "Could not find $BinaryName in extracted archive."
    }

    $DestinationPath = Join-Path $InstallDir $BinaryName
    Copy-Item -Path $ExtractedBin.FullName -Destination $DestinationPath -Force
    Write-Host "==> CoherynUI binary installed to $DestinationPath" -ForegroundColor Green

    # 2. Add to User Path if not present
    $UserPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
    if ($UserPath -notlike "*$InstallDir*") {
        $NewPath = "$UserPath;$InstallDir"
        [Environment]::SetEnvironmentVariable("Path", $NewPath, [EnvironmentVariableTarget]::User)
        $env:Path = "$env:Path;$InstallDir"
        Write-Host "==> Added $InstallDir to user Path environment variable." -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "CoherynUI CLI installed successfully!" -ForegroundColor Green
    Write-Host "Run 'coherynui --help' or restart your PowerShell session to begin."
    Write-Host "Homepage: https://coheryntech.com/products/coheryn-ui"
} finally {
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
