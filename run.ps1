param(
    [switch]$frontend,
    [switch]$backend
)

if ($frontend) {
    Write-Host "Starting frontend..." -ForegroundColor Green
    Set-Location frontend
    npm i
    npm run dev
}
elseif ($backend) {
    Write-Host "Starting backend..." -ForegroundColor Green
    Set-Location backend
    & .\.venv\Scripts\Activate.ps1
    fastapi dev ./api/main.py
}
else {
    Write-Host "Usage: .\run.ps1 -frontend or .\run.ps1 -backend" -ForegroundColor Yellow
    exit 1
}
