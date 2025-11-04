/**
 * Example: REST API Client
 * Demonstrates how to use the REST API endpoints
 */

async function testRESTAPI() {
  const baseURL = 'http://localhost:3000';

  console.log('🚀 Testing Mermaid MCP Connector REST API\n');
  console.log('💡 Make sure the server is running: mermaid-connector rest\n');

  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const health = await fetch(`${baseURL}/health`);
    const healthData = await health.json();
    console.log('Health:', healthData);

    // Get available tools
    console.log('\n2️⃣ Getting available tools...');
    const toolsRes = await fetch(`${baseURL}/api/tools`);
    const toolsData = await toolsRes.json();
    console.log(`Found ${toolsData.tools.length} tools`);

    // Generate a diagram
    console.log('\n3️⃣ Generating diagram...');
    const generateRes = await fetch(`${baseURL}/api/diagram/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Create a flowchart for user registration process',
        filename: 'registration.svg'
      })
    });
    const generateData = await generateRes.json();
    console.log('Generated:', generateData.success ? '✅ Success' : '❌ Failed');
    if (generateData.result) {
      console.log('Result:', JSON.stringify(generateData.result).substring(0, 200) + '...');
    }

    // Get diagram types
    console.log('\n4️⃣ Getting diagram types...');
    const typesRes = await fetch(`${baseURL}/api/diagram/types`);
    const typesData = await typesRes.json();
    console.log('Diagram types:', typesData.success ? '✅ Received' : '❌ Failed');

    // Get templates
    console.log('\n5️⃣ Getting templates...');
    const templatesRes = await fetch(`${baseURL}/api/templates?category=architecture`);
    const templatesData = await templatesRes.json();
    console.log('Templates:', templatesData.success ? '✅ Received' : '❌ Failed');

    // Validate syntax
    console.log('\n6️⃣ Validating Mermaid syntax...');
    const validateRes = await fetch(`${baseURL}/api/diagram/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'flowchart TD\\n    A --> B\\n    B --> C'
      })
    });
    const validateData = await validateRes.json();
    console.log('Validation:', validateData.success ? '✅ Valid' : '❌ Invalid');

    console.log('\n✨ All tests completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Make sure the REST API server is running:');
    console.log('   mermaid-connector rest');
    process.exit(1);
  }
}

testRESTAPI();
