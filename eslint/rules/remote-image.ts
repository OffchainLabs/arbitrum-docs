/**
 * A markdown image with an `http(s)` src. It becomes `next/image`, whose optimizer rejects every
 * remote host here, so the reader gets a broken image. Commit the file under `public/`, or wrap an
 * `<img>` in `<ImageZoom>`.
 */
import { type MdxRuleDefinition, maskedText } from '../shared.ts';

const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?(https?:\/\/[^\s<>)]+)/g;
const LINK_DEFINITION = /^[ \t]{0,3}\[([^\]\n]+)\]:[ \t]*<?(\S+?)>?(?:[ \t]|$)/gm;
const IMAGE_REFERENCE = /!\[([^\]]*)\]\[([^\]]*)\]/g;

const label = (s: string): string => s.trim().replace(/\s+/g, ' ').toLowerCase();

const rule: MdxRuleDefinition<'remoteImage'> = {
  meta: {
    type: 'problem',
    docs: { description: 'markdown image with a remote src renders broken' },
    messages: {
      remoteImage:
        'markdown image with a remote src renders broken ({{url}}); commit it under public/ or wrap an <img> in <ImageZoom>',
    },
  },
  create(context) {
    const { sourceCode } = context;
    const report = (index: number, url: string): void =>
      context.report({
        loc: sourceCode.getLocFromIndex(index),
        messageId: 'remoteImage',
        data: { url },
      });
    return {
      root() {
        const text = maskedText(sourceCode);
        for (const m of text.matchAll(MARKDOWN_IMAGE)) report(m.index, m[1]);
        const definitions = new Map<string, string>();
        for (const m of text.matchAll(LINK_DEFINITION)) {
          if (!definitions.has(label(m[1]))) definitions.set(label(m[1]), m[2]);
        }
        for (const m of text.matchAll(IMAGE_REFERENCE)) {
          const url = definitions.get(label(m[2] || m[1]));
          if (url && /^https?:\/\//i.test(url)) report(m.index, url);
        }
      },
    };
  },
};

export default rule;
