// Simple test script for master prompt generation
const { buildMasterPrompt } = require('./src/lib/masterPromptConfig.ts');

console.log('Testing Master Prompt Generation...\n');

try {
  // Test 1: With tone and length
  console.log('=== Test 1: With tone and length ===');
  const prompt1 = buildMasterPrompt(
    'roses',
    'Design a scalable microservices architecture for an e-commerce platform',
    'professional',
    'detailed'
  );
  console.log(prompt1);
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Without tone and length
  console.log('=== Test 2: Without tone and length ===');
  const prompt2 = buildMasterPrompt(
    'ape',
    'Analyze customer feedback data to identify improvement opportunities',
    undefined,
    undefined
  );
  console.log(prompt2);
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Different framework
  console.log('=== Test 3: Different framework ===');
  const prompt3 = buildMasterPrompt(
    'tag',
    'Improve website conversion rates by 25%',
    'casual',
    'medium'
  );
  console.log(prompt3);

} catch (error) {
  console.error('Error:', error.message);
}
