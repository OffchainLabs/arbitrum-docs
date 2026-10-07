import { parse } from '@babel/parser';
import type { Node } from '@babel/types';

/** Parse code rather than matching dependency examples in comments or strings. */
function parseModule(source: string, filename: string) {
  return parse(source, {
    sourceFilename: filename,
    sourceType: 'unambiguous',
    allowReturnOutsideFunction: true,
    createImportExpressions: true,
    plugins: [
      ...(/\.[cm]?tsx?$/.test(filename) ? ['typescript' as const] : []),
      ...(/\.[jt]sx$/.test(filename) ? ['jsx' as const] : []),
    ],
  });
}

/** Next recognizes `use client` anywhere in the leading directive prologue. */
export function isClientModule(source: string, filename = 'module.tsx'): boolean {
  return parseModule(source, filename).program.directives.some(
    (directive) => directive.value.value === 'use client',
  );
}

function literalSpecifier(node: Node | null | undefined): string | null {
  if (node?.type === 'StringLiteral') return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked ?? null;
  }
  return null;
}

/** Runtime ESM, re-export, dynamic import and CommonJS dependencies; types are erased. */
export function importSpecifiers(source: string, filename = 'module.tsx'): string[] {
  const out: string[] = [];
  function visit(node: Node): void {
    let specifier: string | null = null;
    switch (node.type) {
      case 'ImportDeclaration':
        // With verbatimModuleSyntax, `import { type X }` still emits `import {}`.
        // Only declaration-level `import type` removes the dependency completely.
        if (node.importKind !== 'type') specifier = node.source.value;
        break;
      case 'ExportAllDeclaration':
        if (node.exportKind !== 'type') specifier = node.source.value;
        break;
      case 'ExportNamedDeclaration':
        if (node.exportKind !== 'type') specifier = node.source?.value ?? null;
        break;
      case 'ImportExpression':
        specifier = literalSpecifier(node.source);
        break;
      case 'CallExpression':
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          specifier = literalSpecifier(node.arguments[0]);
        }
        break;
      case 'TSImportEqualsDeclaration':
        if (
          node.importKind !== 'type' &&
          node.moduleReference.type === 'TSExternalModuleReference'
        ) {
          specifier = literalSpecifier(node.moduleReference.expression);
        }
        break;
    }
    if (specifier !== null) out.push(specifier);
    // Every AST child is visited, including calls inside functions and template expressions.
    for (const value of Object.values(node)) {
      for (const child of Array.isArray(value) ? value : [value]) {
        if (child && typeof child === 'object' && typeof child.type === 'string') visit(child);
      }
    }
  }
  visit(parseModule(source, filename).program);
  return out;
}
