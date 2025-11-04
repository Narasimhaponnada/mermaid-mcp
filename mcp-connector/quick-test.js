/**
 * Quick Test: Separate Architecture
 * Tests: AI Agent → Connector (HTTP) → MCP Server (stdio)
 */

const http = require('http');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, emoji, message) {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
}

async function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  const baseUrl = 'localhost';
  const port = 3000;
  
  logSection('🧪 Testing Separate Architecture');
  log('blue', '📋', 'Architecture: AI Agent → Connector (HTTP) → MCP Server (stdio)');
  console.log();

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  logSection('Test 1: Health Check (Connector Availability)');
  try {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/health',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.body.status === 'ok') {
      log('green', '✅', `PASS: Connector is running`);
      log('blue', '📊', `Response: ${JSON.stringify(response.body)}`);
      passed++;
    } else {
      log('red', '❌', `FAIL: Unexpected response`);
      log('yellow', '⚠️', `Response: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    log('red', '❌', `FAIL: ${error.message}`);
    log('yellow', '⚠️', `Make sure the connector is running: node dist/cli.js rest`);
    failed++;
    return; // Exit early if connector not running
  }

  // Test 2: MCP Server Connection
  logSection('Test 2: MCP Server Connection (stdio)');
  try {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/diagram/types',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.body.success) {
      log('green', '✅', `PASS: Connector → MCP Server connection works`);
      log('blue', '📊', `Available diagram types: ${response.body.data.length}`);
      console.log(`   Types: ${response.body.data.slice(0, 5).join(', ')}...`);
      passed++;
    } else {
      log('red', '❌', `FAIL: Could not connect to MCP server`);
      log('yellow', '⚠️', `Response: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    log('red', '❌', `FAIL: ${error.message}`);
    failed++;
  }

  // Test 3: OpenAPI Specification
  logSection('Test 3: OpenAPI Specification (For ChatGPT)');
  try {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/openapi.json',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.body.openapi) {
      log('green', '✅', `PASS: OpenAPI spec is available`);
      log('blue', '📊', `OpenAPI version: ${response.body.openapi}`);
      log('blue', '📊', `Title: ${response.body.info.title}`);
      log('blue', '📊', `Endpoints: ${Object.keys(response.body.paths).length}`);
      passed++;
    } else {
      log('red', '❌', `FAIL: OpenAPI spec not found`);
      failed++;
    }
  } catch (error) {
    log('red', '❌', `FAIL: ${error.message}`);
    failed++;
  }

  // Test 4: ChatGPT Plugin Manifest
  logSection('Test 4: ChatGPT Plugin Manifest');
  try {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/.well-known/ai-plugin.json',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.body.schema_version) {
      log('green', '✅', `PASS: ChatGPT plugin manifest is available`);
      log('blue', '📊', `Plugin name: ${response.body.name_for_human}`);
      log('blue', '📊', `Schema version: ${response.body.schema_version}`);
      passed++;
    } else {
      log('red', '❌', `FAIL: Plugin manifest not found`);
      failed++;
    }
  } catch (error) {
    log('red', '❌', `FAIL: ${error.message}`);
    failed++;
  }

  // Test 5: Diagram Generation (Full Flow)
  logSection('Test 5: Diagram Generation (AI Agent → Connector → MCP)');
  try {
    log('blue', '🚀', 'Simulating ChatGPT request...');
    
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/diagram/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      description: 'Create a simple flowchart with start, process, and end nodes'
    });

    if (response.statusCode === 200 && response.body.success) {
      log('green', '✅', `PASS: End-to-end diagram generation works!`);
      log('blue', '📊', `Diagram type: ${response.body.data.type}`);
      log('blue', '📊', `Code length: ${response.body.data.code.length} chars`);
      log('blue', '📊', `SVG generated: ${response.body.data.svg ? 'Yes ✓' : 'No ✗'}`);
      
      console.log('\n' + colors.yellow + '📝 Generated Mermaid Code:' + colors.reset);
      console.log(colors.cyan + response.body.data.code.split('\n').slice(0, 10).join('\n') + colors.reset);
      if (response.body.data.code.split('\n').length > 10) {
        console.log(colors.cyan + '   ... (truncated)' + colors.reset);
      }
      
      passed++;
    } else {
      log('red', '❌', `FAIL: Diagram generation failed`);
      log('yellow', '⚠️', `Response: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    log('red', '❌', `FAIL: ${error.message}`);
    failed++;
  }

  // Test 6: Diagram Validation
  logSection('Test 6: Diagram Validation');
  try {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/diagram/validate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      code: 'graph TD\n    A[Start] --> B[End]'
    });

    if (response.statusCode === 200 && response.body.success) {
      log('green', '✅', `PASS: Diagram validation works`);
      log('blue', '📊', `Valid: ${response.body.data.valid}`);
      passed++;
    } else {
      log('red', '❌', `FAIL: Validation failed`);
      log('yellow', '⚠️', `Response: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    log('red', '❌', `FAIL: ${error.message}`);
    failed++;
  }

  // Test 7: Template Retrieval
  logSection('Test 7: Template Retrieval');
  try {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/templates?type=flowchart',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.body.success) {
      log('green', '✅', `PASS: Template retrieval works`);
      log('blue', '📊', `Templates found: ${response.body.data.templates.length}`);
      passed++;
    } else {
      log('red', '❌', `FAIL: Template retrieval failed`);
      failed++;
    }
  } catch (error) {
    log('red', '❌', `FAIL: ${error.message}`);
    failed++;
  }

  // Test 8: Export Functionality
  logSection('Test 8: Export Functionality');
  try {
    const response = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/diagram/export',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      code: 'graph TD\n    A[Start] --> B[End]',
      format: 'svg'
    });

    if (response.statusCode === 200 && response.body.success) {
      log('green', '✅', `PASS: Export functionality works`);
      log('blue', '📊', `Export format: ${response.body.data.format}`);
      log('blue', '📊', `Content length: ${response.body.data.content.length} chars`);
      passed++;
    } else {
      log('red', '❌', `FAIL: Export failed`);
      log('yellow', '⚠️', `Response: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    log('red', '❌', `FAIL: ${error.message}`);
    failed++;
  }

  // Summary
  logSection('📊 Test Summary');
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.blue}📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%${colors.reset}`);
  
  console.log('\n' + colors.cyan + '═'.repeat(60) + colors.reset);
  
  if (failed === 0) {
    log('green', '🎉', 'All tests passed! Separate architecture is working perfectly!');
    console.log();
    log('blue', '📝', 'Architecture verified:');
    console.log('   1. ✓ Connector is running on HTTP (port 3000)');
    console.log('   2. ✓ Connector connects to MCP Server via stdio');
    console.log('   3. ✓ AI Agent can communicate with Connector via HTTP');
    console.log();
    log('yellow', '🚀', 'Next steps:');
    console.log('   1. Deploy connector to Railway/Render for ChatGPT');
    console.log('   2. Configure ChatGPT plugin with your public URL');
    console.log('   3. Test with: "Create a sequence diagram for user login"');
  } else {
    log('yellow', '⚠️', 'Some tests failed. Please check the errors above.');
    console.log();
    log('blue', '💡', 'Common issues:');
    console.log('   1. Is the connector running? Run: node dist/cli.js rest');
    console.log('   2. Is MCP server installed? Run: npm install -g @narasimhaponnada/mermaid-mcp-server');
    console.log('   3. Is the port available? Check: lsof -i :3000');
  }
  
  console.log();
}

// Run the tests
runTests().catch(error => {
  console.error(colors.red + '❌ Fatal error: ' + error.message + colors.reset);
  process.exit(1);
});
