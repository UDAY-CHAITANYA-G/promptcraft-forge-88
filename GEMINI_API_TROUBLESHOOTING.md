# Gemini API Troubleshooting Guide

## Common Error: "models/gemini-pro is not found for API version v1beta"

This error occurs when the Gemini API configuration is outdated or incorrect. Here's how to resolve it:

## ✅ Solution: Updated API Configuration

The system now automatically tries multiple Gemini models and API versions:

### 1. **Updated Model Names**
- **Primary**: `gemini-1.5-pro` (Latest and recommended)
- **Secondary**: `gemini-1.5-flash` (Fast and efficient)
- **Fallback**: `gemini-pro` (Legacy model)

### 2. **API Version Fallback**
- **Primary**: `v1` (Latest API)
- **Fallback**: `v1beta` (For older models)

### 3. **Automatic Retry Logic**
The system now automatically tries different models and API versions until one works.

## 🔧 How to Test Your Gemini API

### Option 1: Use the Test Script
```bash
# Set your API key as environment variable
export GEMINI_API_KEY="your-actual-api-key"

# Run the test script
node test-gemini-api.js
```

### Option 2: Test in Browser Console
```javascript
// Test API connectivity
const apiKey = 'your-api-key';
const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
const data = await response.json();
console.log('Available models:', data.data?.map(m => m.name));
```

## 🚨 Common Issues and Solutions

### Issue 1: "API key not valid"
**Solution**: 
- Verify your API key is correct
- Check that you've enabled the Gemini API in Google Cloud Console
- Ensure your API key has the necessary permissions

### Issue 2: "API not enabled"
**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for "Gemini API"
5. Click "Enable"

### Issue 3: "Quota exceeded"
**Solution**:
- Check your usage in Google Cloud Console
- Consider upgrading your plan
- Wait for quota reset (usually daily)

### Issue 4: "Model not available in region"
**Solution**:
- Some models may not be available in all regions
- Try using a different model from the fallback list
- Contact Google Cloud support if issues persist

## 📋 Required Setup Steps

### 1. **Enable Gemini API**
```bash
# Using gcloud CLI (if you have it installed)
gcloud services enable generativelanguage.googleapis.com
```

### 2. **Create API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "API Key"
4. Copy the generated key

### 3. **Configure in Your App**
1. Go to the API Configuration page in your app
2. Enter your Gemini API key
3. Save the configuration

## 🔍 Debugging Information

The updated system now provides comprehensive debugging:

### Console Logs
- Shows which models are being tried
- Displays API version attempts
- Logs success/failure for each attempt

### Error Messages
- More descriptive error messages
- Specific failure reasons
- Suggested solutions

### Model Availability
- Lists available models for your API key
- Shows which models are accessible
- Provides fallback recommendations

## 📱 Testing in the App

1. **Navigate to Prompt Generator**
2. **Select Gemini as your model**
3. **Enter a task description**
4. **Click "Generate Prompt"**
5. **Check the debug information** (expandable sections)

The system will automatically:
- Test your API key
- Try different models
- Use the best available option
- Show detailed debugging information

## 🆘 Still Having Issues?

If you continue to experience problems:

1. **Check the console logs** for detailed error information
2. **Verify your API key** is correct and enabled
3. **Test with the provided script** to isolate the issue
4. **Check Google Cloud Console** for any service issues
5. **Review the error messages** for specific guidance

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Management](https://console.cloud.google.com/apis/credentials)
- [Gemini Model Availability](https://ai.google.dev/models/gemini)

---

**Note**: The system now automatically handles most common Gemini API issues and provides fallback options to ensure your prompts are generated successfully.
