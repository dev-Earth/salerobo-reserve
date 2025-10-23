# テストデータ追加 ランダム番号
$randomNumber = Get-Random -Minimum 1000 -Maximum 9999
$body = @{
    number = $randomNumber.ToString()
    type = "3dp"
    created = (Get-Date -Format "yyyy/MM/dd-HH:mm:ss")
    mail = "test@example.com"
    status = "false"
} | ConvertTo-Json

Write-Host "追加するデータ: number=$randomNumber"

Write-Host "データを追加中..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/orders" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    Write-Host $response.Content
} catch {
    Write-Host "エラー: $_"
}

Write-Host "`n全データを取得中..."
try {
    $getData = Invoke-WebRequest -Uri "http://localhost:3001/api/orders" -UseBasicParsing
    Write-Host $getData.Content
} catch {
    Write-Host "エラー: $_"
}
