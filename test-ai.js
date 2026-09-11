import { streamChatWithFallback } from './cli/lib/aiClient.js';
async function run() {
  try {
    await streamChatWithFallback([{ role: 'user', content: 'hi' }], { model: 'auto' });
  } catch(e) {
    console.error("ERROR TYPE:", e.constructor.name);
    console.error("ERROR MSG:", e.message);
  }
}
run();
