import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const dom = new JSDOM('<!DOCTYPE html><body></body>');
const window = dom.window;
global.document = window.document;
global.window = window;

const purifyInstance = DOMPurify(window);
const completeDOMPurify = {
  sanitize: purifyInstance.sanitize.bind(purifyInstance),
  addHook: purifyInstance.addHook.bind(purifyInstance),
  removeHook: purifyInstance.removeHook.bind(purifyInstance)
};

window.DOMPurify = completeDOMPurify;
global.DOMPurify = completeDOMPurify;
globalThis.DOMPurify = completeDOMPurify;

// Now import mermaid
import mermaid from 'mermaid';

console.log('After mermaid import:');
console.log('global.DOMPurify:', typeof global.DOMPurify);
console.log('global.DOMPurify.sanitize:', typeof global.DOMPurify?.sanitize);
console.log('window.DOMPurify:', typeof window.DOMPurify);
console.log('window.DOMPurify.sanitize:', typeof window.DOMPurify?.sanitize);

// Try to call sanitize
try {
  const result = global.DOMPurify.sanitize('<p>test</p>');
  console.log('Sanitize works! Result:', result);
} catch (e) {
  console.log('Sanitize failed:', e.message);
}
