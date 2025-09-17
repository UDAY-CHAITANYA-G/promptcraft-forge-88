// Test script for Gemini API connectivity
// Run this with: node test-gemini-api.js

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY || 'your-api-key-here';
  
  if (apiKey === 'your-api-key-here') {
    console.log('Please set GEMINI_API_KEY environment variable or update the script with your actual API key');
    return;
  }

  console.log('Testing Gemini API connectivity...\n');

  try {
    // Test 1: List available models
    console.log('=== Test 1: List Available Models ===');
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    if (!modelsResponse.ok) {
      throw new Error(`Models API failed: ${modelsResponse.status} ${modelsResponse.statusText}`);
    }

    const modelsData = await modelsResponse.json();
    const availableModels = modelsData.data?.map(model => model.name) || [];
    
    console.log('Available models:');
    availableModels.forEach(model => console.log(`  - ${model}`));
    console.log();

    // Test 2: Try to use gemini-1.5-pro
    console.log('=== Test 2: Test gemini-1.5-pro ===');
    const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Hello! Please respond with "Test successful" in JSON format: {"response": "Test successful"}'
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      })
    });

    if (!generateResponse.ok) {
      const errorData = await generateResponse.json().catch(() => ({}));
      throw new Error(`Generate API failed: ${generateResponse.status} ${generateResponse.statusText} - ${errorData.error?.message || ''}`);
    }

    const generateData = await generateResponse.json();
    const content = generateData.candidates[0]?.content?.parts[0]?.text || 'No content received';
    
    console.log('Response received:');
    console.log(content);
    console.log();

    // Test 3: Try to use gemini-1.5-flash as fallback
    console.log('=== Test 3: Test gemini-1.5-flash ===');
    const flashResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Hello! Please respond with "Flash test successful" in JSON format: {"response": "Flash test successful"}'
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      })
    });

    if (!flashResponse.ok) {
      const errorData = await flashResponse.json().catch(() => ({}));
      console.log(`Flash API failed: ${flashResponse.status} ${flashResponse.statusText} - ${errorData.error?.message || ''}`);
    } else {
      const flashData = await flashResponse.json();
      const flashContent = flashData.candidates[0]?.content?.parts[0]?.text || 'No content received';
      
      console.log('Flash response received:');
      console.log(flashContent);
    }

    console.log('\n✅ Gemini API tests completed successfully!');
    console.log('Your API key is working and the models are accessible.');

  } catch (error) {
    console.error('\n❌ Gemini API test failed:', error.message);
    
    if (error.message.includes('403')) {
      console.log('\n💡 This might be a permissions issue. Check that:');
      console.log('  1. Your API key is correct');
      console.log('  2. You have enabled the Gemini API in Google Cloud Console');
      console.log('  3. Your API key has the necessary permissions');
    } else if (error.message.includes('404')) {
      console.log('\n💡 This might be a model availability issue. Try:');
      console.log('  1. Using a different model name');
      console.log('  2. Checking if the model is available in your region');
      console.log('  3. Verifying your API key has access to the requested model');
    }
  }
}

// Run the test
testGeminiAPI();
