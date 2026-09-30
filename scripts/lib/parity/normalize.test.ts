import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  imageName,
  isDefaultCalloutLabel,
  normalizeCode,
  normalizeText,
  sameIgnoringWhitespace,
  tokens,
} from './normalize.ts';

test('normalizeText collapses whitespace, including non-breaking spaces and newlines', () => {
  assert.equal(normalizeText('  one\n\ttwo\u00A0 three  '), 'one two three');
});

test('normalizeText strips zero-width characters and soft hyphens', () => {
  assert.equal(normalizeText('Heading\u200B'), 'Heading');
  assert.equal(normalizeText('inter\u00ADoperability'), 'interoperability');
  assert.equal(normalizeText('a\u200C\u200D\u2060\uFEFFb'), 'ab');
});

test('normalizeText straightens curly quotes', () => {
  assert.equal(normalizeText('\u2018it\u2019s\u2019 \u201Cquoted\u201D'), "'it's' \"quoted\"");
});

test('normalizeText turns every dash into a hyphen', () => {
  assert.equal(normalizeText('a\u2013b c\u2212d\u2011e'), 'a-b c-d-e');
  assert.equal(normalizeText('12\u201315 seconds'), normalizeText('12-15 seconds'));
});

test('normalizeText treats an em dash, spaced or not, as a spaced hyphen', () => {
  assert.equal(normalizeText('guide\u2014each'), 'guide - each');
  assert.equal(normalizeText('guide \u2014 each'), 'guide - each');
  assert.equal(normalizeText('guide \u2013 each'), 'guide - each');
  assert.equal(normalizeText('guide - each'), 'guide - each');
  assert.notEqual(normalizeText('full-node'), normalizeText('full - node'));
});

test('normalizeText keeps real wording differences', () => {
  assert.notEqual(normalizeText('the majority'), normalizeText('the body'));
  assert.notEqual(normalizeText('12-15 seconds'), normalizeText('15 seconds'));
});

test('isDefaultCalloutLabel drops only the default labels', () => {
  for (const label of [
    'Note',
    'info',
    'TIP',
    'Caution',
    'warning',
    'Danger',
    'Important',
    'Note:',
  ]) {
    assert.ok(isDefaultCalloutLabel(label), label);
  }
  assert.ok(!isDefaultCalloutLabel('Looking for Stylus guidance?'));
  assert.ok(!isDefaultCalloutLabel('Important notice'));
});

test('normalizeCode keeps whitespace but drops a trailing newline and zero-width characters', () => {
  assert.equal(normalizeCode('  a\n\tb\u200B\n\n'), '  a\n\tb');
});

test('sameIgnoringWhitespace ignores only whitespace', () => {
  assert.ok(sameIgnoringWhitespace('a  b\nc', 'ab c'));
  assert.ok(!sameIgnoringWhitespace('a b', 'a c'));
});

test('imageName reads through the Next image optimizer and strips content hashes', () => {
  assert.equal(imageName('/img/haw-geth-sandwich.svg'), 'haw-geth-sandwich.svg');
  assert.equal(
    imageName('/_next/image?url=%2Fimg%2Fhaw-eds-napkin-drawing.png&w=3840&q=75'),
    'haw-eds-napkin-drawing.png',
  );
  assert.equal(imageName('/assets/images/diagram-3f2a9c1d.png'), 'diagram.png');
  assert.equal(imageName('/_next/static/media/diagram.3f2a9c1d7e6b5a40.png'), 'diagram.png');
  assert.equal(imageName('https://example.com/a/My%20Image.png?x=1'), 'My Image.png');
  assert.equal(imageName('/img/v2-chart.png'), 'v2-chart.png');
});

test('tokens splits words and punctuation, lowercased', () => {
  assert.deepEqual(tokens('Hello, World_1!'), ['hello', ',', 'world_1', '!']);
});
