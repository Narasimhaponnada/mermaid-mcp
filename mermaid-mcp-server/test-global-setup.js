import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body></body>');
const purifyInstance = DOMPurify(dom.window);

console.log('=== What we set on global ===');
console.log('Type:', typeof purifyInstance);
console.log('addHook type:', typeof purifyInstance.addHook);
console.log('Is addHook a function?', typeof purifyInstance.addHook === 'function');

// Test calling addHook
console.log('\n=== Testing addHook call ===');
try {
  purifyInstance.addHook('beforeSanitizeAttributes', (node) => {});
  console.log('✅ addHook works!');
  purifyInstance.removeAllHooks();
} catch (e) {
  console.log('❌ addHook failed:', e.message);
}

// Set it like we do in code
global.DOMPurify = purifyInstance;
console.log('\n=== After setting on global ===');
console.log('global.DOMPurify exists:', typeof global.DOMPurify !== 'undefined');
console.log('global.DOMPurify.addHook:', typeof global.DOMPurify.addHook);

// Try calling through global
try {
  global.DOMPurify.addHook('beforeSanitizeAttributes', (node) => {});
  console.log('✅ global.DOMPurify.addHook works!');
  global.DOMPurify.removeAllHooks();
} catch (e) {
  console.log('❌ global.DOMPurify.addHook failed:', e.message);
}
