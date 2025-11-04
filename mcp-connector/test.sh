#!/bin/bash

# Quick Test Script for Mermaid MCP Connector
# This script runs all basic tests to verify the connector is working

echo "🧪 Mermaid MCP Connector - Quick Test Suite"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    ((TESTS_FAILED++))
  fi
  echo ""
}

# Test 1: Check if MCP server is installed
echo "Test 1: Checking MCP server installation..."
if command -v mermaid-mcp &> /dev/null; then
  VERSION=$(mermaid-mcp --version 2>&1)
  test_result 0 "MCP server installed: $VERSION"
else
  test_result 1 "MCP server not found. Run: npm install -g @narasimhaponnada/mermaid-mcp-server"
fi

# Test 2: Check if connector is built
echo "Test 2: Checking connector build..."
if [ -f "dist/cli.js" ]; then
  test_result 0 "Connector build found"
else
  echo -e "${YELLOW}⚠️  Building connector...${NC}"
  npm run build
  if [ -f "dist/cli.js" ]; then
    test_result 0 "Connector built successfully"
  else
    test_result 1 "Connector build failed"
  fi
fi

# Test 3: Test MCP server connection
echo "Test 3: Testing MCP server connection..."
CONN_OUTPUT=$(node dist/cli.js test 2>&1)
if echo "$CONN_OUTPUT" | grep -q "Connection successful"; then
  TOOL_COUNT=$(echo "$CONN_OUTPUT" | grep -oP 'Available tools: \K\d+')
  test_result 0 "MCP server connection successful ($TOOL_COUNT tools available)"
else
  test_result 1 "MCP server connection failed"
  echo "Output: $CONN_OUTPUT"
fi

# Test 4: Check if port 3000 is available
echo "Test 4: Checking if port 3000 is available..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  test_result 1 "Port 3000 is already in use. Stop the other service first."
else
  test_result 0 "Port 3000 is available"
fi

# Test 5: Check if port 3001 is available
echo "Test 5: Checking if port 3001 is available..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
  test_result 1 "Port 3001 is already in use. Stop the other service first."
else
  test_result 0 "Port 3001 is available"
fi

# Test 6: Start REST API in background and test
echo "Test 6: Testing REST API..."
echo -e "${YELLOW}Starting REST API server...${NC}"
node dist/cli.js rest > /tmp/mcp-rest.log 2>&1 &
REST_PID=$!
sleep 3

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
  test_result 0 "REST API health check passed"
else
  test_result 1 "REST API health check failed"
  echo "Response: $HEALTH_RESPONSE"
fi

# Test OpenAPI spec
OPENAPI_RESPONSE=$(curl -s http://localhost:3000/openapi.json)
if echo "$OPENAPI_RESPONSE" | grep -q "openapi"; then
  test_result 0 "OpenAPI spec endpoint working"
else
  test_result 1 "OpenAPI spec endpoint failed"
fi

# Test ChatGPT manifest
MANIFEST_RESPONSE=$(curl -s http://localhost:3000/.well-known/ai-plugin.json)
if echo "$MANIFEST_RESPONSE" | grep -q "schema_version"; then
  test_result 0 "ChatGPT plugin manifest endpoint working"
else
  test_result 1 "ChatGPT plugin manifest endpoint failed"
fi

# Test diagram generation endpoint
echo -e "${YELLOW}Testing diagram generation...${NC}"
DIAGRAM_RESPONSE=$(curl -s -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "Create a simple flowchart"}')

if echo "$DIAGRAM_RESPONSE" | grep -q "success"; then
  test_result 0 "Diagram generation endpoint working"
else
  test_result 1 "Diagram generation endpoint failed"
  echo "Response: $DIAGRAM_RESPONSE"
fi

# Stop REST API
echo -e "${YELLOW}Stopping REST API server...${NC}"
kill $REST_PID 2>/dev/null
sleep 1
echo ""

# Test 7: Start WebSocket server in background and test
echo "Test 7: Testing WebSocket server..."
echo -e "${YELLOW}Starting WebSocket server...${NC}"
node dist/cli.js websocket > /tmp/mcp-ws.log 2>&1 &
WS_PID=$!
sleep 3

# Simple WebSocket test using Node
WS_TEST=$(node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001');
ws.on('open', () => {
  console.log('CONNECTED');
  ws.close();
});
ws.on('error', (err) => {
  console.log('ERROR:', err.message);
});
" 2>&1)

if echo "$WS_TEST" | grep -q "CONNECTED"; then
  test_result 0 "WebSocket server accepting connections"
else
  test_result 1 "WebSocket server connection failed"
  echo "Error: $WS_TEST"
fi

# Stop WebSocket server
echo -e "${YELLOW}Stopping WebSocket server...${NC}"
kill $WS_PID 2>/dev/null
sleep 1
echo ""

# Test 8: Check VS Code Copilot configuration
echo "Test 8: Checking VS Code configuration..."
VSCODE_SETTINGS="$HOME/Library/Application Support/Code/User/settings.json"
if [ -f "$VSCODE_SETTINGS" ]; then
  if grep -q "github.copilot.chat.mcp.enabled" "$VSCODE_SETTINGS"; then
    if grep -q "\"github.copilot.chat.mcp.enabled\": true" "$VSCODE_SETTINGS"; then
      test_result 0 "VS Code Copilot MCP is enabled"
    else
      test_result 1 "VS Code Copilot MCP is disabled. Set 'github.copilot.chat.mcp.enabled: true'"
    fi
  else
    echo -e "${YELLOW}⚠️  VS Code Copilot MCP not configured${NC}"
    echo "Add this to $VSCODE_SETTINGS:"
    echo '{'
    echo '  "github.copilot.chat.mcp.enabled": true,'
    echo '  "github.copilot.chat.mcp.servers": {'
    echo '    "mermaid": {'
    echo '      "command": "mermaid-mcp"'
    echo '    }'
    echo '  }'
    echo '}'
    test_result 1 "VS Code Copilot MCP not configured"
  fi
else
  echo -e "${YELLOW}⚠️  VS Code settings file not found${NC}"
  test_result 1 "VS Code not installed or settings file not found"
fi

# Test 9: Check Claude Desktop configuration
echo "Test 9: Checking Claude Desktop configuration..."
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CLAUDE_CONFIG" ]; then
  if grep -q "mermaid" "$CLAUDE_CONFIG"; then
    test_result 0 "Claude Desktop configured for Mermaid MCP"
  else
    echo -e "${YELLOW}⚠️  Claude Desktop not configured for Mermaid${NC}"
    echo "Add this to $CLAUDE_CONFIG:"
    echo '{'
    echo '  "mcpServers": {'
    echo '    "mermaid": {'
    echo '      "command": "mermaid-mcp"'
    echo '    }'
    echo '  }'
    echo '}'
    test_result 1 "Claude Desktop not configured for Mermaid MCP"
  fi
else
  echo -e "${YELLOW}⚠️  Claude Desktop config file not found${NC}"
  test_result 1 "Claude Desktop not installed or config file not found"
fi

# Test 10: Check if ngrok is installed (for ChatGPT testing)
echo "Test 10: Checking ngrok installation (for ChatGPT testing)..."
if command -v ngrok &> /dev/null; then
  test_result 0 "ngrok is installed (ready for ChatGPT testing)"
else
  echo -e "${YELLOW}⚠️  ngrok not installed${NC}"
  echo "Install with: brew install ngrok"
  test_result 1 "ngrok not installed (needed for ChatGPT local testing)"
fi

# Summary
echo ""
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed! Your connector is ready!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Test with GitHub Copilot: Open VS Code and use @mermaid in Copilot Chat"
  echo "2. Test with ChatGPT: Run 'node dist/cli.js rest' then 'ngrok http 3000'"
  echo "3. Test with Claude: Open Claude Desktop and ask to create a diagram"
  echo ""
  echo "For detailed testing instructions, see: TESTING_GUIDE.md"
else
  echo -e "${YELLOW}⚠️  Some tests failed. Please fix the issues above.${NC}"
  echo ""
  echo "Common fixes:"
  echo "- Install MCP server: npm install -g @narasimhaponnada/mermaid-mcp-server"
  echo "- Build connector: npm run build"
  echo "- Configure VS Code: See TESTING_GUIDE.md"
  echo "- Configure Claude: See TESTING_GUIDE.md"
fi

echo ""
