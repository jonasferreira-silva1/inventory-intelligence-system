# Script para criar arquivo .env
$envContent = @"
DATABASE_URL="postgresql://postgres:jonas1385@localhost:5432/smartstock"
JWT_SECRET="sua-chave-secreta-super-segura-aqui-altere-em-producao-123456789"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
"@

$envPath = Join-Path $PSScriptRoot ".env"

$envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline

Write-Host "✅ Arquivo .env criado em: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Conteúdo:" -ForegroundColor Yellow
Get-Content $envPath

