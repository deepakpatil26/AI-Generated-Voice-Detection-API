#!/bin/bash

# AI Voice Detection API - Endpoint Test Script
# This script tests the API endpoint as per hackathon requirements

API_URL="http://localhost:8000"
API_KEY="your-secret-api-key-change-in-production"

echo "========================================="
echo "AI Voice Detection API - Endpoint Tester"
echo "========================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-------------------"
curl -s -X GET "$API_URL/api/health" | jq '.'
echo ""
echo ""

# Test 2: API Info
echo "Test 2: API Info"
echo "----------------"
curl -s -X GET "$API_URL/" | jq '.'
echo ""
echo ""

# Test 3: Voice Detection with Missing API Key
echo "Test 3: Voice Detection - Missing API Key (Should Fail)"
echo "--------------------------------------------------------"
curl -s -X POST "$API_URL/api/voice/detect" \
  -H "Content-Type: application/json" \
  -d '{
    "audioBase64": "test",
    "language": "English"
  }' | jq '.'
echo ""
echo ""

# Test 4: Voice Detection with Invalid API Key
echo "Test 4: Voice Detection - Invalid API Key (Should Fail)"
echo "--------------------------------------------------------"
curl -s -X POST "$API_URL/api/voice/detect" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: invalid-key" \
  -d '{
    "audioBase64": "test",
    "language": "English"
  }' | jq '.'
echo ""
echo ""

# Test 5: Voice Detection with Missing Language
echo "Test 5: Voice Detection - Missing Language (Should Fail)"
echo "---------------------------------------------------------"
curl -s -X POST "$API_URL/api/voice/detect" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "audioBase64": "test"
  }' | jq '.'
echo ""
echo ""

# Test 6: Voice Detection with Invalid Language
echo "Test 6: Voice Detection - Invalid Language (Should Fail)"
echo "---------------------------------------------------------"
curl -s -X POST "$API_URL/api/voice/detect" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "audioBase64": "test",
    "language": "Spanish"
  }' | jq '.'
echo ""
echo ""

# Test 7: Voice Detection with Case-Insensitive Language
echo "Test 7: Voice Detection - Case-Insensitive Language (Should Work)"
echo "------------------------------------------------------------------"
curl -s -X POST "$API_URL/api/voice/detect" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "audioBase64": "test",
    "language": "english"
  }' | jq '.'
echo ""
echo ""

# Test 8: Voice Detection with Valid MP3 Base64 (Sample)
echo "Test 8: Voice Detection - Valid Request with Sample MP3"
echo "--------------------------------------------------------"
# Create a minimal MP3 base64 (ID3 header)
SAMPLE_MP3_BASE64="SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T8DeGGAAAAAAD/+xDEAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAIAAAOEALu7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v///////////////////////////////////////////8AAAA8TGF2YzU4LjEzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEAAABSABQAAAAA"

curl -s -X POST "$API_URL/api/voice/detect" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"audioBase64\": \"$SAMPLE_MP3_BASE64\",
    \"language\": \"English\"
  }" | jq '.'
echo ""
echo ""

# Test 9: Test All Supported Languages
echo "Test 9: Test All Supported Languages"
echo "-------------------------------------"
for lang in "Tamil" "English" "Hindi" "Malayalam" "Telugu"; do
  echo "Testing language: $lang"
  curl -s -X POST "$API_URL/api/voice/detect" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d "{
      \"audioBase64\": \"$SAMPLE_MP3_BASE64\",
      \"language\": \"$lang\"
    }" | jq -r '.status + " - " + .language + " - " + .classification'
  echo ""
done
echo ""

# Test 10: Debug Endpoint
echo "Test 10: Debug Analysis Endpoint"
echo "---------------------------------"
curl -s -X POST "$API_URL/api/debug/analyze" \
  -H "Content-Type: application/json" \
  -d "{
    \"audioBase64\": \"$SAMPLE_MP3_BASE64\",
    \"language\": \"English\"
  }" | jq '.'
echo ""
echo ""

echo "========================================="
echo "All Tests Completed!"
echo "========================================="
