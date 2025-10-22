# Quick Test Commands - Diagram Fix

## Step 1: Restart Backend Server

### Windows (Your Environment)

```powershell
# Stop any running backend server (Ctrl+C if running in terminal)
# Or find and kill the process:
Get-Process -Name "python" | Where-Object {$_.Path -like "*backend*"} | Stop-Process -Force

# Navigate to backend directory
cd C:\Users\usdoss02\Projects\AISolutions\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the server
python server.py
```

### Alternative: One Command
```powershell
cd C:\Users\usdoss02\Projects\AISolutions\backend; .\venv\Scripts\Activate.ps1; python server.py
```

## Step 2: Restart Frontend (if running)

```powershell
# In a new terminal
cd C:\Users\usdoss02\Projects\AISolutions\frontend

# Stop with Ctrl+C, then restart:
npm run dev
```

## Step 3: Test Diagram Generation

### Option A: Via UI
1. Open browser: http://localhost:5173
2. Enter test requirement: "Create a VPC with public and private subnets"
3. Click "Generate Architecture"
4. Watch the backend terminal for logs

### Option B: Via API (PowerShell)
```powershell
# Test API directly
$body = @{
    requirements = "Create a VPC with two subnets"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/generate" -Method POST -Body $body -ContentType "application/json"
```

### Option C: Via curl (if installed)
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d "{\"requirements\": \"Create a VPC with two subnets\"}"
```

## Step 4: Verify Diagram File Created

```powershell
# Check diagrams directory
dir C:\Users\usdoss02\Projects\AISolutions\backend\diagrams

# Should see:
# - sample.png (existing)
# - architecture_YYYYMMDD_HHMMSS.png (NEW!)
```

## Step 5: Check Backend Logs

Look for these SUCCESS indicators in the backend terminal:

```
✅ Connected to AWS Diagram MCP Server.
📊 Discovered X tools from AWS Diagram MCP Server.
🚀 Running Diagram agent...
✅ Diagram response received: XXX characters
📝 Diagram response preview: [first 500 chars]
✅ Diagram saved to: diagrams/architecture_20250122_143052.png
```

## Step 6: Test Download

1. In UI, click "Download Results"
2. Extract the ZIP file
3. Verify it contains the new architecture_*.png file

```powershell
# Or check via API
Invoke-WebRequest -Uri "http://localhost:8000/diagram/architecture_20250122_143052.png" -OutFile "test_diagram.png"

# Verify file size (should be > 1KB if real diagram)
(Get-Item test_diagram.png).Length
```

## Quick Verification Commands

```powershell
# 1. Verify fix is applied
cd C:\Users\usdoss02\Projects\AISolutions\backend
Select-String -Path "strands_agent.py" -Pattern "_extract_and_save_diagram"
# Should show 2 matches at lines ~227 and ~384

# 2. Check if server is running
Test-NetConnection -ComputerName localhost -Port 8000

# 3. Test health endpoint
Invoke-RestMethod -Uri "http://localhost:8000/" -Method GET

# 4. Count diagram files
(Get-ChildItem "C:\Users\usdoss02\Projects\AISolutions\backend\diagrams" -Filter "*.png").Count
```

## Troubleshooting

### Backend won't start
```powershell
# Check if port 8000 is in use
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

# Kill process using port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```

### Frontend won't connect
```powershell
# Check CORS settings in backend/server.py
# Should include: "http://localhost:5173"
```

### No diagram file created
```powershell
# Check directory exists
New-Item -ItemType Directory -Force -Path "C:\Users\usdoss02\Projects\AISolutions\backend\diagrams"

# Check permissions
icacls "C:\Users\usdoss02\Projects\AISolutions\backend\diagrams"
```

## Expected Test Results

### ✅ SUCCESS
- New PNG file appears in `backend/diagrams/`
- File is > 10KB (not just placeholder)
- Logs show "✅ Diagram saved to: ..."
- Download includes the new diagram

### ❌ FAILURE (Needs Investigation)
- Only sample.png exists
- Logs show "⚠️ Could not extract or save diagram"
- Fallback being used

---

**Test Status Template:**

Copy and fill this out after testing:

```
Test Date: [DATE]
Backend Started: [ ] Yes [ ] No
Frontend Started: [ ] Yes [ ] No
Diagram Generated: [ ] Yes [ ] No
File Created: [ ] Yes [ ] No
Filename: _________________________
File Size: ____________ KB
Download Works: [ ] Yes [ ] No
Logs Look Good: [ ] Yes [ ] No

Issues Found:
- 

Next Steps:
-
```

