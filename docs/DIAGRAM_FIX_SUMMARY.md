# Architecture Diagram Fix Summary

## Problem

Architecture diagrams were not being created or saved when users downloaded results from the AWS Agentic Builder UI.

## Root Cause Analysis

The issue was in the diagram extraction and saving logic in `backend/strands_agent.py`:

### Original Flawed Approach (Lines 378-402)

```python
def _extract_diagram_url(self, response: str) -> str:
    """Extract diagram URL from agent response"""
    # Only looked for URL patterns like:
    # - http://example.com/diagram.png
    # - /path/to/diagram.png
    # - file://diagram.png
    
    # Problem: The AWS Diagram MCP server likely returns:
    # 1. Base64-encoded image data (not URLs)
    # 2. File paths that need to be copied
    # 3. Or creates files that need to be discovered
    
    # If no URL pattern found, just returned fallback:
    return "/diagram/sample.png"  # Always same sample!
```

### Key Issues

1. **No File Saving**: The code only extracted URL strings from text but never saved actual diagram files
2. **Wrong Data Format**: Expected URLs but MCP servers typically return image data or file references
3. **No File Creation**: Diagrams directory existed but no new files were created in it
4. **Path Issues**: Used relative paths that could break depending on working directory

## The Fix

### 1. New Diagram Extraction Method

Replaced `_extract_diagram_url()` with `_extract_and_save_diagram()` that:

#### Handles Multiple Data Formats

```python
def _extract_and_save_diagram(self, response: str) -> str:
    # 1. Try to extract base64-encoded images
    base64_patterns = [
        r'data:image/[^;]+;base64,([A-Za-z0-9+/=\s]+)',
        r'<img[^>]+src="data:image/[^;]+;base64,([A-Za-z0-9+/=\s]+)"',
        r'```base64\s*([A-Za-z0-9+/=\s]+)\s*```',
    ]
    
    # 2. Try to find file paths in response
    file_path_patterns = [
        r'(?:file://)?([/\\]?[\w/\\.-]+\.(?:png|jpg|jpeg|svg))',
        r'(?:saved|created|written) (?:to|at|as):?\s*([/\\]?[\w/\\.-]+\.(?:png|jpg|jpeg|svg))',
    ]
    
    # 3. Save extracted data to timestamped file
    diagram_filename = f"architecture_{timestamp}.png"
    
    # 4. Return proper URL for frontend
    return f"/diagram/{diagram_filename}"
```

### 2. Fixed File Path Handling

```python
# Before (relative paths - unreliable)
diagrams_dir = "diagrams"

# After (absolute paths - reliable)
backend_dir = os.path.dirname(os.path.abspath(__file__))
diagrams_dir = os.path.join(backend_dir, "diagrams")
```

### 3. Enhanced Logging

Added detailed logging to help debug what the MCP server actually returns:

```python
response_preview = str(response)[:500]
print(f"📝 Diagram response preview: {response_preview}...")
```

### 4. Improved Server Configuration

Updated `backend/server.py` to use absolute paths:

```python
# Ensure diagrams directory exists and use absolute path
diagrams_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "diagrams")
os.makedirs(diagrams_path, exist_ok=True)
app.mount("/diagram", StaticFiles(directory=diagrams_path), name="diagrams")
```

## How It Works Now

### Diagram Generation Flow

```
1. User Request
   └─> Backend generates CF template

2. Diagram Generation
   └─> Strands Agent calls AWS Diagram MCP Server with CF template
   └─> MCP Server generates diagram (returns image data or file path)
   └─> Agent returns response with diagram data

3. Extraction & Saving (NEW!)
   └─> Parse response for base64 image data → Decode → Save as PNG
   └─> OR parse response for file path → Copy file to diagrams/
   └─> Generate unique filename: architecture_20250122_143052.png
   └─> Return URL: /diagram/architecture_20250122_143052.png

4. Download Results
   └─> Frontend includes diagram URL in download
   └─> Diagram file actually exists and is accessible! ✅
```

## Files Modified

### 1. `backend/strands_agent.py`
- ✅ Added `import shutil` for file copying
- ✅ Replaced `_extract_diagram_url()` with `_extract_and_save_diagram()`
- ✅ Added base64 image extraction logic
- ✅ Added file path detection and copying logic
- ✅ Fixed paths to use absolute paths
- ✅ Enhanced logging with response previews

### 2. `backend/server.py`
- ✅ Updated diagrams directory path to use absolute paths
- ✅ Added automatic directory creation
- ✅ Updated `/diagram/{filename}` endpoint to use correct paths

### 3. `docs/product_tracker.md`
- ✅ Documented the fix with full details

## Testing Checklist

To verify the fix works:

1. **Start Backend Server**
   ```bash
   cd backend
   python server.py
   ```

2. **Generate Architecture**
   - Make a request through the UI or API
   - Watch the backend logs for:
     ```
     📊 Discovered X tools from AWS Diagram MCP Server.
     🚀 Running Diagram agent...
     ✅ Diagram response received: XXX characters
     📝 Diagram response preview: ...
     ✅ Diagram saved to: diagrams/architecture_YYYYMMDD_HHMMSS.png
     ```

3. **Check Diagram File**
   ```bash
   ls -la backend/diagrams/
   # Should see new architecture_*.png files
   ```

4. **Verify Download**
   - Download results from UI
   - Check that diagram is included and not just sample.png
   - Verify diagram shows the actual generated architecture

## Expected Outcomes

### Before Fix ❌
- Downloads always included `sample.png` (generic placeholder)
- No new diagram files created in `diagrams/` directory
- Users couldn't see their actual architecture diagrams

### After Fix ✅
- Each generation creates a unique diagram file
- Diagrams saved with timestamp: `architecture_20250122_143052.png`
- Downloads include the actual generated diagram
- Multiple diagrams can be saved and accessed
- Better logging for debugging MCP server responses

## Fallback Behavior

The fix maintains backward compatibility:

```python
# If diagram extraction fails at any point:
return self._get_fallback_diagram_url()  # Returns "/diagram/sample.png"
```

This ensures:
- System never crashes due to diagram issues
- Users always get something in their downloads
- Errors are logged for debugging

## Next Steps

1. **Monitor First Run**: Check logs to see which extraction pattern works
2. **Adjust if Needed**: The AWS Diagram MCP server output format may require pattern adjustments
3. **Add Format Support**: Consider supporting SVG, JPEG in addition to PNG
4. **Add Validation**: Verify saved files are valid images
5. **Cleanup Old Diagrams**: Implement periodic cleanup of old diagram files

## Questions to Verify

After deployment, confirm:
- ✅ Are diagram files being created in `backend/diagrams/`?
- ✅ Are the files valid PNG images?
- ✅ Do downloads include the correct diagrams?
- ✅ Which extraction method is working (base64 or file path)?
- ✅ Are there any errors in the logs?

---

**Date:** 2025-01-22  
**Author:** AI Assistant  
**Status:** Ready for Testing

