# Gemini API Setup Instructions

## The current API key is invalid. Here's how to get a valid one:

### Step 1: Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the full API key (it should be much longer than the current one)

### Step 2: Update Environment Variables
Replace the current API key in `.env` file:

```bash
# Replace this line:
VITE_GOOGLE_AI_API_KEY=AIzaSyCYeMbakT9VVdutpRMJyEQigZlx6jtnADE

# With your new full API key:
VITE_GOOGLE_AI_API_KEY=AIzaSyC_YOUR_FULL_API_KEY_HERE_MUCH_LONGER

# Also update:
GEMINI_API_KEY=AIzaSyC_YOUR_FULL_API_KEY_HERE_MUCH_LONGER
```

### Step 3: Restart the Server
After updating the API key, restart the development server:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Current Issue
The API key `AIzaSyCYeMbakT9VVdutpRMJyEQigZlx6jtnADE` is either:
- Incomplete/truncated
- Invalid/expired
- Not properly configured

A valid Gemini API key should be much longer (typically 39+ characters).

### Test the API Key
Once you have a valid key, the enhanced AI analysis will work and provide:
- Real-time clause extraction
- Risk analysis
- Image text extraction
- URL content analysis
- No mock data fallbacks