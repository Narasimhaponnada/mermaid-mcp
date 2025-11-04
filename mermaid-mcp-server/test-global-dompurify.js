import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body></body>');
const purifyInstance = DOMPurify(dom.window);

// Set on global
global.DOMPurify = purifyInstance;

// Test access
console.log('global.DOMPurify exists:', typeof global.DOMPurify);
console.log('global.DOMPurify.addHook exists:', typeof global.DOMPurify.addHook);

// Test if it works like Mermaid expects
const testModule = new Function('return typeof DOMPurify !== "undefined" && typeof DOMPurify.addHook === "function"');
console.log('Can access DOMPurify directly:', testModule());

// The real problem: Mermaid code does "DOMPurify.addHook" not "global.DOMPurify.addHook"
// In ES modules, we need to check if it's in the global scope
console.log('\nMaking DOMPurify truly global...');
globalThis.DOMPurify = purifyInstance;
console.log('globalThis.DOMPurify exists:', typeof globalThis.DOMPurify);
console.log('globalThis.DOMPurify.addHook exists:', typeof globalThis.DOMPurify.addHook);
