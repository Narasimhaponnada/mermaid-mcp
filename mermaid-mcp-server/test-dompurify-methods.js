import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const dom = new JSDOM('<!DOCTYPE html><body></body>');
const purify = DOMPurify(dom.window);

console.log('DOMPurify instance methods:');
console.log('addHook:', typeof purify.addHook);
console.log('sanitize:', typeof purify.sanitize);
console.log('removeHook:', typeof purify.removeHook);
console.log('removeHooks:', typeof purify.removeHooks);
console.log('isSupported:', typeof purify.isSupported);

console.log('\nAll methods:', Object.getOwnPropertyNames(purify));
