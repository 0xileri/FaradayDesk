$ErrorActionPreference = 'Stop'
Write-Host 'Enter your Bitget Qwen key privately. It will be saved as a Windows user environment variable for Codex and in the ignored .env.qwen file for FaradayDesk setup.'
$secureKey = Read-Host 'Bitget Qwen API key (hidden)' -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
  $qwenKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  if ([string]::IsNullOrWhiteSpace($qwenKey) -or $qwenKey -match '\s') { throw 'The key must be nonempty and contain no whitespace.' }
  [Environment]::SetEnvironmentVariable('BITGET_QWEN_API_KEY', $qwenKey, 'User')
  $keyFile = Join-Path (Split-Path $PSScriptRoot -Parent) '.env.qwen'
  [IO.File]::WriteAllText($keyFile, "BITGET_QWEN_API_KEY=$qwenKey`n")
  Write-Host 'Key saved. No key value was displayed. Return to the FaradayDesk task and say done.'
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  $qwenKey = $null
}
