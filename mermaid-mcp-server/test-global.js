import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body></body>');
const purifyInstance = DOMPurify(dom.window);

// Test globalThis
globalThis.DOMPurify = purifyInstance;

console.log('✅ Test Results:');
console.log('1. globalThis.DOMPurify exists:', typeof globalThis.DOMPurify);
console.log('2. globalThis.DOMPurify.addHook:', typeof globalThis.DOMPurify.addHook);
console.log('3. Testing addHook call...');

try {
  globalThis.DOMPurify.addHook('beforeSanitizeAttributes', (node) => {
    console.log('  Hook test passed!');
  });
  console.log('✅ addHook works!');
  globalThis.DOMPurify.removeAllHooks();
} catch (error) {
  console.log('❌ addHook failed:', error.message);
}
