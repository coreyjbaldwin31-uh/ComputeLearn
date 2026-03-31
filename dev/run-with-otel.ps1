param(
  [int]$Port = 3000,
  [switch]$EnsureCollector
)

$ErrorActionPreference = "Stop"

function Resolve-ToolPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string[]]$CandidateCommands
  )

  foreach ($candidate in $CandidateCommands) {
    $command = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($null -ne $command) {
      return $command.Source
    }
  }

  throw "Unable to locate $Name. Tried: $($CandidateCommands -join ', ')"
}

if ($EnsureCollector) {
  & "$HOME\.alloy\start-local-otel-debug.ps1" | Out-Host
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$env:OTEL_SERVICE_NAME = if ($env:OTEL_SERVICE_NAME) { $env:OTEL_SERVICE_NAME } else { "ComputeLearn" }
$env:OTEL_EXPORTER_OTLP_ENDPOINT = if ($env:OTEL_EXPORTER_OTLP_ENDPOINT) { $env:OTEL_EXPORTER_OTLP_ENDPOINT } else { "http://127.0.0.1:14318" }
$env:OTEL_EXPORTER_OTLP_PROTOCOL = if ($env:OTEL_EXPORTER_OTLP_PROTOCOL) { $env:OTEL_EXPORTER_OTLP_PROTOCOL } else { "http/protobuf" }
$npm = Resolve-ToolPath -Name "npm" -CandidateCommands @("npm.cmd", "npm")

Push-Location $repoRoot
try {
  & $npm run dev -- --hostname 127.0.0.1 --port $Port
}
finally {
  Pop-Location
}
