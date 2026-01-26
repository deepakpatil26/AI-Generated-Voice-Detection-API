# AI Voice Detection API - Simple Test Script
# Tests the local API endpoint

$API_URL = "http://localhost:8000"
$API_KEY = "94d8c354e7b3a1398c96a38dc079112dbfa861ba9dfce258fd193cc4f592d35c"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AI Voice Detection API - Endpoint Tester" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
Write-Host "--------------------"
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/health" -Method Get
    Write-Host "Status: $($response.status)" -ForegroundColor Green
    Write-Host "Version: $($response.version)" -ForegroundColor Green
    Write-Host "Uptime: $($response.uptime)s" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: API Info
Write-Host "Test 2: API Info" -ForegroundColor Yellow
Write-Host "----------------"
try {
    $response = Invoke-RestMethod -Uri "$API_URL/" -Method Get
    Write-Host "Message: $($response.message)" -ForegroundColor Green
    Write-Host "Version: $($response.version)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Voice Detection with Missing API Key (Should Fail)
Write-Host "Test 3: Missing API Key (Should Fail)" -ForegroundColor Yellow
Write-Host "--------------------------------------"
try {
    $body = @{
        audioBase64 = "test"
        language = "English"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$API_URL/api/voice/detect" -Method Post -ContentType "application/json" -Body $body
} catch {
    Write-Host "Expected Error: API key is required" -ForegroundColor Green
}
Write-Host ""

# Test 4: Voice Detection with Valid Request
Write-Host "Test 4: Valid Voice Detection Request" -ForegroundColor Yellow
Write-Host "--------------------------------------"
$SAMPLE_MP3 = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T8DeGGAAAAAAD/+xDEAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAIAAAOEALu7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v///////////////////////////////////////////8AAAA8TGF2YzU4LjEzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEAAABSABQAAAAA"

try {
    $headers = @{
        "X-API-Key" = $API_KEY
    }
    $body = @{
        audioBase64 = $SAMPLE_MP3
        language = "English"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$API_URL/api/voice/detect" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    
    Write-Host "Response Summary:" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "  Classification: $($response.classification)" -ForegroundColor Cyan
    Write-Host "  Confidence: $([math]::Round($response.confidence * 100, 1))%" -ForegroundColor Cyan
    Write-Host "  Language: $($response.language)" -ForegroundColor Cyan
    Write-Host "  Processing Time: $($response.processingTimeMs)ms" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Test All Languages
Write-Host "Test 5: All Supported Languages" -ForegroundColor Yellow
Write-Host "--------------------------------"
$languages = @("Tamil", "English", "Hindi", "Malayalam", "Telugu")

foreach ($lang in $languages) {
    try {
        $headers = @{
            "X-API-Key" = $API_KEY
        }
        $body = @{
            audioBase64 = $SAMPLE_MP3
            language = $lang
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$API_URL/api/voice/detect" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        Write-Host "  $lang : $($response.classification) - $([math]::Round($response.confidence * 100, 1))%" -ForegroundColor Green
    } catch {
        Write-Host "  $lang : Error" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "All Tests Completed!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
