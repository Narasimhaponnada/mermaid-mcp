/**
 * Example: WebSocket Client
 * Demonstrates how to connect to the WebSocket server
 */

import { WebSocket } from 'ws';

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server\n');

  // Generate a diagram
  console.log('📤 Requesting diagram generation...');
  ws.send(JSON.stringify({
    action: 'generate_diagram',
    params: {
      description: 'Create a sequence diagram for user login'
    }
  }));

  // Wait a bit, then request diagram types
  setTimeout(() => {
    console.log('\n📤 Requesting diagram types...');
    ws.send(JSON.stringify({
      action: 'get_diagram_types'
    }));
  }, 2000);

  // Wait a bit more, then close
  setTimeout(() => {
    console.log('\n👋 Closing connection');
    ws.close();
  }, 4000);
});

ws.on('message', (data) => {
  console.log('\n📥 Received response:');
  const response = JSON.parse(data.toString());
  console.log(JSON.stringify(response, null, 2));
});

ws.on('close', () => {
  console.log('\n❌ Disconnected from server');
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
  process.exit(1);
});

console.log('🔌 Connecting to WebSocket server at ws://localhost:3001...');
console.log('💡 Make sure the server is running: mermaid-connector websocket\n');
