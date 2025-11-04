import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body></body>');

console.log('===  DOMPurify module (import) ===');
console.log('Type:', typeof DOMPurify);
console.log('Has addHook:', typeof DOMPurify.addHook);

console.log('\n=== DOMPurify instance (called with window) ===');
const instance = DOMPurify(dom.window);
console.log('Type:', typeof instance);
console.log('Has addHook:', typeof instance.addHook);
console.log('Has sanitize:', typeof instance.sanitize);

console.log('\n=== Testing which one Mermaid needs ===');
// Mermaid code does: DOMPurify.addHook(...)
// So it needs the thing we set on global to have addHook method

console.log('\nConclusion: Mermaid needs the INSTANCE, not the module!');
