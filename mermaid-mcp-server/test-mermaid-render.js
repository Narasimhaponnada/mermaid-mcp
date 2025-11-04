import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import mermaid from 'mermaid';

// Setup like in our code
const dom = new JSDOM('<!DOCTYPE html><body></body>');
const window = dom.window;
global.document = window.document;
global.window = window;
globalThis.document = window.document;
globalThis.window = window;

const purify = DOMPurify(window);
window.DOMPurify = purify;
global.DOMPurify = purify;
globalThis.DOMPurify = purify;

console.log('DOMPurify setup complete');
console.log('purify.sanitize type:', typeof purify.sanitize);
console.log('global.DOMPurify.sanitize type:', typeof global.DOMPurify.sanitize);

// Initialize mermaid
await mermaid.initialize({
  theme: 'default',
  startOnLoad: false,
  securityLevel: 'loose',
  logLevel: 'error'
});

console.log('\nAfter mermaid.initialize:');
console.log('global.DOMPurify type:', typeof global.DOMPurify);
console.log('global.DOMPurify.sanitize type:', typeof global.DOMPurify?.sanitize);

// Try to render
try {
  const { svg } = await mermaid.render('test-diagram', 'graph TD\n    A --> B');
  console.log('\n✅ SUCCESS! SVG generated, length:', svg.length);
} catch (error) {
  console.log('\n❌ ERROR:', error.message);
  console.log('Stack:', error.stack);
}
