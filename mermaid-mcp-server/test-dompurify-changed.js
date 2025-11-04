import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const dom = new JSDOM('<!DOCTYPE html><body></body>');
const window = dom.window;
global.document = window.document;
global.window = window;

const purify = DOMPurify(window);
console.log('1. DOMPurify instance type:', typeof purify);
console.log('1. purify.sanitize type:', typeof purify.sanitize);

global.DOMPurify = purify;
console.log('2. After setting global.DOMPurify:', typeof global.DOMPurify);
console.log('2. global.DOMPurify.sanitize type:', typeof global.DOMPurify.sanitize);

// Now import mermaid
import mermaid from 'mermaid';
console.log('3. After importing mermaid:', typeof global.DOMPurify);
console.log('3. global.DOMPurify.sanitize type:', typeof global.DOMPurify?.sanitize);

// Try initialize
await mermaid.initialize({ securityLevel: 'loose' });
console.log('4. After mermaid.initialize:', typeof global.DOMPurify);
console.log('4. global.DOMPurify.sanitize type:', typeof global.DOMPurify?.sanitize);
