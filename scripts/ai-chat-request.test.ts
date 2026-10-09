import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkChatRequest } from '../lib/ai/chat-request.ts';

const site = 'https://docs.arbitrum.io';
const prod = { apiKey: 'k', siteUrl: site, production: true };
const message = { role: 'user', parts: [{ type: 'text', text: 'hi' }] };

function req(init: { body?: string; origin?: string | null; type?: string; length?: string } = {}) {
  const headers = new Headers({ 'content-type': init.type ?? 'application/json' });
  if (init.origin !== null) headers.set('origin', init.origin ?? site);
  if (init.length) headers.set('content-length', init.length);
  return new Request(`${site}/api/chat`, {
    method: 'POST',
    headers,
    body: init.body ?? JSON.stringify({ messages: [message] }),
  });
}

test('accepts a valid request', async () => {
  const r = await checkChatRequest(req(), prod);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.messages.length, 1);
});

test('503 without an API key', async () => {
  const r = await checkChatRequest(req(), { ...prod, apiKey: undefined });
  assert.deepEqual(r, { ok: false, status: 503, error: 'AI assistant is not configured' });
});

test('403 for a foreign origin', async () => {
  const r = await checkChatRequest(req({ origin: 'https://evil.example' }), prod);
  assert.equal(r.ok || r.status, 403);
});

test('403 for a missing origin in production, allowed in development', async () => {
  const p = await checkChatRequest(req({ origin: null }), prod);
  assert.equal(p.ok || p.status, 403);
  const d = await checkChatRequest(req({ origin: null }), { ...prod, production: false });
  assert.equal(d.ok, true);
});

test('415 for a non-JSON content type', async () => {
  const r = await checkChatRequest(req({ type: 'text/plain' }), prod);
  assert.equal(r.ok || r.status, 415);
});

test('413 when content-length says the body is over 32 KiB', async () => {
  const r = await checkChatRequest(req({ length: String(32 * 1024 + 1) }), prod);
  assert.equal(r.ok || r.status, 413);
});

test('413 when the real body is over 32 KiB', async () => {
  const big = JSON.stringify({ messages: [message], pad: 'x'.repeat(32 * 1024) });
  const r = await checkChatRequest(req({ body: big }), prod);
  assert.equal(r.ok || r.status, 413);
});

test('400 for malformed JSON', async () => {
  const r = await checkChatRequest(req({ body: '{' }), prod);
  assert.equal(r.ok || r.status, 400);
});

test('400 for zero messages and for more than 20', async () => {
  const none = await checkChatRequest(req({ body: JSON.stringify({ messages: [] }) }), prod);
  assert.equal(none.ok || none.status, 400);
  const many = JSON.stringify({ messages: Array.from({ length: 21 }, () => message) });
  const r = await checkChatRequest(req({ body: many }), prod);
  assert.equal(r.ok || r.status, 400);
});

test('400 for a system role', async () => {
  const body = JSON.stringify({ messages: [{ role: 'system', parts: [] }] });
  const r = await checkChatRequest(req({ body }), prod);
  assert.equal(r.ok || r.status, 400);
});

test('413 for one message over 8,000 characters', async () => {
  const long = { role: 'user', parts: [{ type: 'text', text: 'x'.repeat(8_001) }] };
  const r = await checkChatRequest(req({ body: JSON.stringify({ messages: [long] }) }), prod);
  assert.equal(r.ok || r.status, 413);
});

test('accepts an assistant message with about 12,000 characters of text', async () => {
  const answer = { role: 'assistant', parts: [{ type: 'text', text: 'x'.repeat(12_000) }] };
  const body = JSON.stringify({ messages: [message, answer, message] });
  const r = await checkChatRequest(req({ body }), prod);
  assert.equal(r.ok, true);
});

test('413 for a user message with 8,001 characters of text in two parts', async () => {
  const parts = [
    { type: 'text', text: 'x'.repeat(4_000) },
    { type: 'text', text: 'x'.repeat(4_001) },
  ];
  const body = JSON.stringify({ messages: [{ role: 'user', parts }] });
  const r = await checkChatRequest(req({ body }), prod);
  assert.equal(r.ok || r.status, 413);
});

test('accepts a user message whose text is short but whose JSON is over 8,000', async () => {
  const parts = [
    { type: 'data-client', data: { location: 'x'.repeat(9_000), title: 't' } },
    { type: 'text', text: 'x'.repeat(7_000) },
  ];
  const body = JSON.stringify({ messages: [{ role: 'user', parts }] });
  const r = await checkChatRequest(req({ body }), prod);
  assert.equal(r.ok, true);
});

function partsBody(messages: unknown[]) {
  return req({ body: JSON.stringify({ messages }) });
}

test('accepts history with every allowed part type', async () => {
  const user = {
    role: 'user',
    parts: [
      { type: 'data-client', data: { location: `${site}/a`, title: 'A' } },
      { type: 'text', text: 'hi' },
    ],
  };
  const answer = {
    role: 'assistant',
    parts: [
      { type: 'step-start' },
      { type: 'text', text: 'hello', state: 'done' },
      {
        type: 'tool-provideLinks',
        toolCallId: 'c1',
        state: 'input-available',
        input: { links: [] },
      },
    ],
  };
  const r = await checkChatRequest(partsBody([user, answer, message]), prod);
  assert.equal(r.ok, true);
});

test('400 for a user file part', async () => {
  const file = { type: 'file', mediaType: 'image/png', url: 'https://evil.example/a.png' };
  const r = await checkChatRequest(partsBody([{ role: 'user', parts: [file] }]), prod);
  assert.equal(r.ok || r.status, 400);
});

test('400 for a tool output, which can carry files', async () => {
  const tool = {
    type: 'tool-provideLinks',
    toolCallId: 'c1',
    state: 'output-available',
    input: {},
    output: { type: 'content', value: [{ type: 'file', url: 'https://evil.example/a' }] },
  };
  const r = await checkChatRequest(
    partsBody([message, { role: 'assistant', parts: [tool] }, message]),
    prod,
  );
  assert.equal(r.ok || r.status, 400);
});

test('400 for a part type outside the allowlist', async () => {
  for (const part of [
    { type: 'source-url', sourceId: 's', url: 'https://evil.example' },
    { type: 'tool-other', toolCallId: 'c1', state: 'input-available', input: {} },
    { type: 'data-client', data: { location: 'x', title: 't' } },
  ]) {
    const r = await checkChatRequest(
      partsBody([message, { role: 'assistant', parts: [part] }, message]),
      prod,
    );
    assert.equal(r.ok || r.status, 400, part.type);
  }
});

test('drops keys the allowlist does not name', async () => {
  const text = {
    type: 'text',
    text: 'hi',
    url: 'https://evil.example',
    providerMetadata: { x: 1 },
  };
  const r = await checkChatRequest(partsBody([{ role: 'user', parts: [text] }]), prod);
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.messages[0]?.parts, [{ type: 'text', text: 'hi' }]);
});
