import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body></body>');
const purify = DOMPurify(dom.window);

console.log('DOMPurify methods:', Object.getOwnPropertyNames(purify).filter(m => typeof purify[m] === 'function'));
console.log('\naddHook exists:', typeof purify.addHook);
console.log('sanitize exists:', typeof purify.sanitize);
