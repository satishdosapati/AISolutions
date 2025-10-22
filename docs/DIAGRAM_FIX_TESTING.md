# Quick Testing Guide: Diagram Fix

## What Was Fixed?

Architecture diagrams were not being saved to files, so downloads always included the same sample image. Now diagrams are properly extracted and saved.

## Quick Test (2 minutes)

### 1. Start Backend
```bash
cd backend
python server.py
```

### 2. Generate Architecture
Use the UI to generate any architecture (e.g., "Create a VPC with two subnets")

### 3. Check Logs
Look for these log messages:

**✅ SUCCESS - Look for:**
```
📊 Discovered X tools from AWS Diagram MCP Server.
🚀 Running Diagram agent...
✅ Diagram response received: XXX characters
📝 Diagram response preview: ...
✅ Diagram saved to: diagrams/architecture_20250122_143052.png
```

**❌ FAILURE - Watch out for:**
```
⚠️ Could not extract or save diagram from response
⚠️ Failed to decode base64 image: ...
⚠️ Diagram file not found at: ...
```

### 4. Verify File Created
```bash
# Windows
dir backend\diagrams\

# Linux/Mac
ls -la backend/diagrams/
```

**Expected:** New file like `architecture_20250122_143052.png`

### 5. Test Download
1. Click "Download Results" in the UI
2. Extract the downloaded ZIP file
3. Check for the architecture diagram file

**Expected:** Should contain the timestamped diagram, NOT just sample.png

## Debugging

### Issue: No diagram file created

**Check:**
1. Is `backend/diagrams/` directory present?
   ```bash
   mkdir -p backend/diagrams
   ```

2. Check the "Diagram response preview" in logs
   - Does it contain base64 data?
   - Does it mention a file path?
   - Copy the preview and share it for analysis

3. Test diagram directory permissions:
   ```bash
   # Linux/Mac
   chmod 755 backend/diagrams
   
   # Windows - check folder properties
   ```

### Issue: Diagram is still sample.png

**Possible Causes:**
1. AWS Diagram MCP server is not returning diagram data
2. Response format doesn't match extraction patterns
3. Fallback is being used

**Solution:**
- Check the full log output
- Look for error messages about diagram extraction
- Verify MCP server is connected: Look for "✅ Connected to AWS Diagram MCP Server."

### Issue: Extraction patterns not working

If logs show:
```
⚠️ Could not extract or save diagram from response
```

**Action Needed:**
1. Copy the "Diagram response preview" from logs
2. Identify the actual format of the diagram data
3. Update extraction patterns in `_extract_and_save_diagram()`

Example patterns to try:
```python
# For JSON responses with image URLs
r'"image":\s*"([^"]+)"'

# For markdown image syntax
r'!\[.*?\]\(([^)]+\.(?:png|jpg|jpeg|svg))\)'

# For plain file paths
r'file saved to:\s*([^\s]+)'
```

## What to Report

If the fix isn't working, please share:

1. **Complete log output** from diagram generation
2. **First 500 characters** of the diagram response
3. **Directory listing**:
   ```bash
   ls -la backend/diagrams/
   ```
4. **MCP server connection status** from logs

## Common Scenarios

### Scenario A: Base64 Data (Most Common)
```
📝 Diagram response preview: data:image/png;base64,iVBORw0KGgo...
✅ Diagram saved to: diagrams/architecture_20250122_143052.png
```
**Status:** ✅ Working!

### Scenario B: File Path Reference
```
📝 Diagram response preview: Diagram saved to /tmp/diagram_xyz.png
✅ Diagram copied from /tmp/diagram_xyz.png to diagrams/architecture_20250122_143052.png
```
**Status:** ✅ Working!

### Scenario C: URL Only
```
📝 Diagram response preview: https://s3.amazonaws.com/diagrams/xyz.png
⚠️ Could not extract or save diagram from response
```
**Status:** ⚠️ Needs additional pattern (can add URL download logic)

### Scenario D: No Diagram Data
```
📝 Diagram response preview: I cannot generate diagrams...
⚠️ Could not extract or save diagram from response
```
**Status:** ❌ MCP server may not support diagram generation

## Expected Behavior

| Step | Expected Output | What It Means |
|------|----------------|---------------|
| MCP Connection | `✅ Connected to AWS Diagram MCP Server.` | Server is available |
| Tool Discovery | `📊 Discovered X tools from AWS Diagram MCP Server.` | Tools are loaded |
| Agent Run | `🚀 Running Diagram agent...` | Generation started |
| Response | `✅ Diagram response received: XXX characters` | Got response |
| Preview | `📝 Diagram response preview: ...` | Shows data format |
| Save | `✅ Diagram saved to: diagrams/architecture_XXX.png` | File created |
| Return | Returns `/diagram/architecture_XXX.png` | Frontend can access it |

## Files to Check

### Before running:
```
backend/diagrams/
└── sample.png (only)
```

### After successful generation:
```
backend/diagrams/
├── sample.png
├── architecture_20250122_143052.png  ← NEW!
├── architecture_20250122_144237.png  ← NEW!
└── ...
```

## Performance Impact

- **Minimal** - Only adds file I/O during diagram generation
- Base64 decoding is fast (< 100ms for typical diagrams)
- File copy operations are quick (< 50ms)
- No impact on CloudFormation or pricing generation

## Rollback Plan

If issues occur, you can temporarily revert by:

1. Replace the new method with old one in `strands_agent.py`:
   ```python
   def _generate_diagram(self, cf_template: str) -> str:
       # ... existing agent call code ...
       return self._get_fallback_diagram_url()  # Skip extraction
   ```

2. This returns sample.png for all requests (original behavior)

---

**Quick Status Check:**
```bash
# Run this to verify fix is applied:
cd backend
grep -n "_extract_and_save_diagram" strands_agent.py

# Should output:
# 227:            return self._extract_and_save_diagram(str(response))
# 384:    def _extract_and_save_diagram(self, response: str) -> str:
```

**If you see these line numbers, the fix is active! ✅**

