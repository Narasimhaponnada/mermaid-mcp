#!/bin/bash

# Mermaid MCP Connector Startup Script
# This script starts the MCP server and connector if they're not already running

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Mermaid MCP Connector - Startup Manager            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
CONNECTOR_DIR="/Users/narasimharao.ponnada/Documents/Mermaid/mcp-connector"
MCP_SERVER_PORT=3000
MCP_SERVER_LOG="$CONNECTOR_DIR/mcp-server.log"
CONNECTOR_LOG="$CONNECTOR_DIR/connector.log"
CONNECTOR_PID_FILE="$CONNECTOR_DIR/.connector.pid"

# Function to check if a process is running
is_process_running() {
    local pid=$1
    if [ -z "$pid" ]; then
        return 1
    fi
    ps -p "$pid" > /dev/null 2>&1
    return $?
}

# Function to check if port is in use
is_port_in_use() {
    local port=$1
    lsof -i :$port -sTCP:LISTEN -t >/dev/null 2>&1
    return $?
}

# Function to stop processes
stop_processes() {
    echo -e "${YELLOW}🛑 Stopping existing processes...${NC}"
    
    # Stop connector
    if [ -f "$CONNECTOR_PID_FILE" ]; then
        local pid=$(cat "$CONNECTOR_PID_FILE")
        if is_process_running "$pid"; then
            echo -e "   Stopping connector (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            sleep 2
            if is_process_running "$pid"; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        fi
        rm -f "$CONNECTOR_PID_FILE"
    fi
    
    # Stop any process on port 3000
    if is_port_in_use $MCP_SERVER_PORT; then
        local pid=$(lsof -ti :$MCP_SERVER_PORT)
        echo -e "   Stopping process on port $MCP_SERVER_PORT (PID: $pid)..."
        kill "$pid" 2>/dev/null || true
        sleep 2
    fi
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    echo ""
}

# Function to start the connector
start_connector() {
    echo -e "${BLUE}🚀 Starting Mermaid MCP Connector...${NC}"
    
    # Check if already running
    if [ -f "$CONNECTOR_PID_FILE" ]; then
        local pid=$(cat "$CONNECTOR_PID_FILE")
        if is_process_running "$pid"; then
            echo -e "${YELLOW}⚠️  Connector already running (PID: $pid)${NC}"
            return 0
        fi
    fi
    
    # Check if port is available
    if is_port_in_use $MCP_SERVER_PORT; then
        echo -e "${RED}❌ Port $MCP_SERVER_PORT is already in use${NC}"
        echo -e "   Run with --stop first to clean up"
        return 1
    fi
    
    # Start connector in background
    cd "$CONNECTOR_DIR"
    
    echo -e "   Starting connector on port $MCP_SERVER_PORT..."
    nohup node dist/cli.js rest > "$CONNECTOR_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$CONNECTOR_PID_FILE"
    
    # Wait a bit and check if it started successfully
    sleep 3
    
    if is_process_running "$pid"; then
        echo -e "${GREEN}✅ Connector started successfully (PID: $pid)${NC}"
        echo -e "   Log file: $CONNECTOR_LOG"
        echo -e "   API: http://localhost:$MCP_SERVER_PORT"
        
        # Test health endpoint
        if curl -s http://localhost:$MCP_SERVER_PORT/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Health check passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Health check failed (server may still be initializing)${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}❌ Connector failed to start${NC}"
        echo -e "   Check log: tail -f $CONNECTOR_LOG"
        rm -f "$CONNECTOR_PID_FILE"
        return 1
    fi
}

# Function to check status
check_status() {
    echo -e "${BLUE}📊 Status Check${NC}"
    echo ""
    
    local all_good=true
    
    # Check connector
    if [ -f "$CONNECTOR_PID_FILE" ]; then
        local pid=$(cat "$CONNECTOR_PID_FILE")
        if is_process_running "$pid"; then
            echo -e "${GREEN}✅ Connector: Running (PID: $pid)${NC}"
        else
            echo -e "${RED}❌ Connector: Not running (stale PID file)${NC}"
            all_good=false
        fi
    else
        echo -e "${RED}❌ Connector: Not running${NC}"
        all_good=false
    fi
    
    # Check port
    if is_port_in_use $MCP_SERVER_PORT; then
        local pid=$(lsof -ti :$MCP_SERVER_PORT)
        echo -e "${GREEN}✅ Port $MCP_SERVER_PORT: In use by PID $pid${NC}"
    else
        echo -e "${RED}❌ Port $MCP_SERVER_PORT: Not in use${NC}"
        all_good=false
    fi
    
    # Check health endpoint
    if curl -s http://localhost:$MCP_SERVER_PORT/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health endpoint: Responding${NC}"
    else
        echo -e "${RED}❌ Health endpoint: Not responding${NC}"
        all_good=false
    fi
    
    echo ""
    if [ "$all_good" = true ]; then
        echo -e "${GREEN}🎉 All systems operational!${NC}"
    else
        echo -e "${YELLOW}⚠️  Some services are not running${NC}"
        echo -e "   Run: $0 --start"
    fi
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Recent Logs${NC}"
    echo ""
    
    if [ -f "$CONNECTOR_LOG" ]; then
        echo -e "${YELLOW}=== Connector Log (last 20 lines) ===${NC}"
        tail -20 "$CONNECTOR_LOG"
    else
        echo -e "${RED}No connector log found${NC}"
    fi
    
    echo ""
}

# Function to test with curl
run_tests() {
    echo -e "${BLUE}🧪 Running Tests${NC}"
    echo ""
    
    # Test 1: Health check
    echo -e "${YELLOW}Test 1: Health Check${NC}"
    response=$(curl -s http://localhost:$MCP_SERVER_PORT/health)
    if echo "$response" | grep -q "ok"; then
        echo -e "${GREEN}✅ PASS${NC}: $response"
    else
        echo -e "${RED}❌ FAIL${NC}: $response"
    fi
    echo ""
    
    # Test 2: Diagram types
    echo -e "${YELLOW}Test 2: Get Diagram Types${NC}"
    response=$(curl -s http://localhost:$MCP_SERVER_PORT/api/diagram/types)
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✅ PASS${NC}: Got diagram types"
    else
        echo -e "${RED}❌ FAIL${NC}: $response"
    fi
    echo ""
    
    # Test 3: Generate diagram
    echo -e "${YELLOW}Test 3: Generate Diagram${NC}"
    response=$(curl -s -X POST http://localhost:$MCP_SERVER_PORT/api/diagram/generate \
        -H "Content-Type: application/json" \
        -d '{"description": "Create a simple flowchart with start and end"}')
    
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✅ PASS${NC}: Diagram generated"
        echo "Response preview: $(echo "$response" | jq -r '.data.type' 2>/dev/null || echo 'N/A')"
    else
        echo -e "${RED}❌ FAIL${NC}: $response"
    fi
    echo ""
}

# Main script logic
case "${1:-}" in
    --start)
        start_connector
        ;;
    --stop)
        stop_processes
        ;;
    --restart)
        stop_processes
        sleep 2
        start_connector
        ;;
    --status)
        check_status
        ;;
    --logs)
        show_logs
        ;;
    --test)
        run_tests
        ;;
    --help|-h)
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  --start      Start the connector (if not already running)"
        echo "  --stop       Stop the connector and cleanup"
        echo "  --restart    Stop and start the connector"
        echo "  --status     Check if services are running"
        echo "  --logs       Show recent logs"
        echo "  --test       Run curl tests against the API"
        echo "  --help       Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 --start     # Start the connector"
        echo "  $0 --status    # Check if running"
        echo "  $0 --test      # Test with curl commands"
        echo "  $0 --logs      # View logs"
        echo ""
        ;;
    "")
        # Default: start if not running, otherwise show status
        if [ -f "$CONNECTOR_PID_FILE" ]; then
            local pid=$(cat "$CONNECTOR_PID_FILE")
            if is_process_running "$pid"; then
                check_status
            else
                start_connector
            fi
        else
            start_connector
        fi
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        echo "Run '$0 --help' for usage information"
        exit 1
        ;;
esac
