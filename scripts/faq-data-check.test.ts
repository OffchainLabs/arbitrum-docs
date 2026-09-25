import assert from 'node:assert/strict';
import { test } from 'node:test';

import { extractFaqsIdUnion, extractFaqsIdUsages, validateFaqEntries } from './lib/faq-data.ts';

test('extractFaqsIdUsages finds a double-quoted faqsId with its line number', () => {
  const source = 'line one\n<FAQStructuredDataJsonLd faqsId="bridging" />\n';
  assert.deepEqual(extractFaqsIdUsages(source), [{ id: 'bridging', line: 2 }]);
});

test('extractFaqsIdUsages finds a single-quoted faqsId', () => {
  const source = "<FAQStructuredDataJsonLd faqsId='node-running' />";
  assert.deepEqual(extractFaqsIdUsages(source), [{ id: 'node-running', line: 1 }]);
});

test('extractFaqsIdUsages also matches the shorter FAQStructuredData alias', () => {
  // `FAQStructuredData` and `FAQStructuredDataJsonLd` are registered as the same component in
  // components/mdx.tsx, so a page using either name must be found by the check.
  const source = '<FAQStructuredData faqsId="get-started" />';
  assert.deepEqual(extractFaqsIdUsages(source), [{ id: 'get-started', line: 1 }]);
});

test('extractFaqsIdUsages ignores other components and other attributes', () => {
  const source = '<Var name="faqsId" />\n<SomeOtherThing faqsId="not-this-one-either" foo="bar" />';
  // `SomeOtherThing` is neither `FAQStructuredData` nor `FAQStructuredDataJsonLd`, so it should
  // not match.
  const usages = extractFaqsIdUsages(source).filter((u) => u.id !== 'not-this-one-either');
  assert.deepEqual(usages, []);
});

test('extractFaqsIdUsages finds multiple usages across a file', () => {
  const source = [
    '<FAQStructuredDataJsonLd faqsId="a" />',
    'some prose',
    '<FAQStructuredDataJsonLd renderFaqs faqsId="b" />',
  ].join('\n');
  assert.deepEqual(extractFaqsIdUsages(source), [
    { id: 'a', line: 1 },
    { id: 'b', line: 3 },
  ]);
});

test('extractFaqsIdUnion parses the FaqsId string-literal union', () => {
  const source = [
    'export type FaqsId =',
    "  'bridging' | 'building' | 'building-orbit' | 'building-stylus' | 'get-started' | 'node-running';",
    '',
    'export interface FAQStructuredDataProps {',
    '  faqsId: FaqsId;',
    '}',
  ].join('\n');
  assert.deepEqual(extractFaqsIdUnion(source), [
    'bridging',
    'building',
    'building-orbit',
    'building-stylus',
    'get-started',
    'node-running',
  ]);
});

test('extractFaqsIdUnion returns an empty array when there is no FaqsId declaration', () => {
  assert.deepEqual(extractFaqsIdUnion('export interface FAQ { question: string; }'), []);
});

test('validateFaqEntries accepts a well-formed non-empty array', () => {
  const data = [
    { question: 'Q1', answer: 'A1', key: 'q1' },
    { question: 'Q2', answer: 'A2', key: 'q2' },
  ];
  assert.deepEqual(validateFaqEntries(data), []);
});

test('validateFaqEntries rejects a non-array', () => {
  assert.deepEqual(validateFaqEntries({ question: 'Q', answer: 'A', key: 'k' }), [
    'data is not an array',
  ]);
});

test('validateFaqEntries rejects an empty array', () => {
  assert.deepEqual(validateFaqEntries([]), ['data array is empty']);
});

test('validateFaqEntries flags a missing or empty field', () => {
  const issues = validateFaqEntries([{ question: 'Q', answer: '', key: 'k' }]);
  assert.deepEqual(issues, ['entry 0: "answer" is not a non-empty string']);
});

test('validateFaqEntries flags a non-string field', () => {
  const issues = validateFaqEntries([{ question: 'Q', answer: 'A', key: 42 }]);
  assert.deepEqual(issues, ['entry 0: "key" is not a non-empty string']);
});

test('validateFaqEntries flags duplicate keys', () => {
  const data = [
    { question: 'Q1', answer: 'A1', key: 'dup' },
    { question: 'Q2', answer: 'A2', key: 'dup' },
  ];
  assert.deepEqual(validateFaqEntries(data), ['entry 1: duplicate key "dup"']);
});
