/**
 * Result rows and the Go definition of one JSON-RPC method of the OpenAPI document, without the
 * JSON-RPC envelope. Row types are labels in TypeScript notation, a neutral way to write a JSON
 * shape. Maps only the JSON Schema keywords the result schemas use and throws on any other, so a
 * new keyword fails the generator instead of shipping a wrong label.
 */
type Json = Record<string, any>;

export interface ResultRow {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface MethodTypes {
  go: string;
  result: ResultRow[];
}

const KEYWORDS = new Set([
  ...['$ref', 'title', 'description', 'examples', 'pattern', 'minimum'],
  ...['type', 'const', 'enum', 'oneOf'],
  'items',
  ...['properties', 'required', 'additionalProperties'],
]);

function literal(value: unknown): string {
  return typeof value === 'string' ? `'${value}'` : JSON.stringify(value);
}

function propertyKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`;
}

class TypeMapper {
  private readonly doc: Json;
  private readonly method: string;

  constructor(doc: Json, method: string) {
    this.doc = doc;
    this.method = method;
  }

  target(ref: string): { name: string; node: Json } {
    const key = ref.split('/').at(-1) ?? '';
    const node = this.doc.components?.schemas?.[key] as Json | undefined;
    if (!node) throw new Error(`${this.method}: unresolved $ref ${ref}`);
    return { name: (node.title as string | undefined) ?? key, node };
  }

  resolve(node: Json): Json {
    return node.$ref ? this.resolve(this.target(node.$ref as string).node) : node;
  }

  label(node: Json, indent = ''): string {
    for (const key of Object.keys(node)) {
      if (!KEYWORDS.has(key)) throw new Error(`${this.method}: cannot type the keyword ${key}`);
    }
    if (node.$ref) return this.target(node.$ref as string).name;
    if ('const' in node) return literal(node.const);
    if (node.enum) return (node.enum as unknown[]).map(literal).join(' | ');
    if (node.oneOf) return (node.oneOf as Json[]).map((n) => this.label(n, indent)).join(' | ');
    if (node.type === 'array') return this.array(node, indent);
    if (node.type === 'object') return this.object(node, indent);
    const primitive = { string: 'string', integer: 'number', null: 'null', boolean: 'boolean' };
    const type = primitive[node.type as keyof typeof primitive];
    if (!type) throw new Error(`${this.method}: cannot type ${JSON.stringify(node)}`);
    return type;
  }

  private array(node: Json, indent: string): string {
    const item = this.label(node.items as Json, indent);
    return item.includes(' | ') ? `(${item})[]` : `${item}[]`;
  }

  private object(node: Json, indent: string): string {
    const properties = Object.entries((node.properties ?? {}) as Record<string, Json>);
    if (properties.length === 0) {
      const values = node.additionalProperties as Json | undefined;
      return `Record<string, ${values ? this.label(values, indent) : 'unknown'}>`;
    }
    const required = new Set((node.required ?? []) as string[]);
    const inner = `${indent}  `;
    const lines = properties.map(([key, value]) => {
      const optional = required.has(key) ? '' : '?';
      return `${inner}${propertyKey(key)}${optional}: ${this.label(value, inner)};`;
    });
    return `{\n${lines.join('\n')}\n${indent}}`;
  }
}

function fields(mapper: TypeMapper, node: Json, prefix: string): ResultRow[] {
  const required = new Set((node.required ?? []) as string[]);
  return Object.entries((node.properties ?? {}) as Record<string, Json>).map(([key, value]) => ({
    name: `${prefix}${key}`,
    type: mapper.label(value),
    required: required.has(key),
    description:
      (value.description as string | undefined) ??
      (mapper.resolve(value).description as string | undefined) ??
      '',
  }));
}

/** Result rows: the fields of an object result, else the whole result plus any item fields. */
function resultRows(mapper: TypeMapper, result: Json): ResultRow[] {
  const top = { name: 'result', type: mapper.label(result), required: true, description: '' };
  const variants = (result.oneOf ?? [result]) as Json[];
  const values = variants.map((v) => mapper.resolve(v)).filter((v) => v.type !== 'null');
  const value = values.length === 1 ? values[0] : undefined;
  const hasFields = (n: Json | undefined) =>
    n?.type === 'object' && Object.keys(n.properties ?? {}).length > 0;
  if (hasFields(value)) {
    const own = fields(mapper, value as Json, '');
    return values.length === variants.length ? own : [top, ...own];
  }
  const item = value?.type === 'array' ? mapper.resolve(value.items as Json) : undefined;
  return hasFields(item) ? [top, ...fields(mapper, item as Json, '[].')] : [top];
}

/**
 * Result rows and Go definition for the method whose operationId is `id`.
 *
 * Args:
 *   doc: The OpenAPI document, with its `$ref`s unresolved.
 *   id: The JSON-RPC method name, which is the operation's operationId.
 */
export function methodTypes(doc: Json, id: string): MethodTypes {
  const op = Object.values((doc.paths ?? {}) as Record<string, { post?: Json }>).find(
    ({ post }) => post?.operationId === id,
  )?.post;
  if (!op) throw new Error(`${id}: no such operation in the OpenAPI document`);
  const go = op['x-arbitrum-go'];
  if (typeof go !== 'string') {
    throw new Error(`${id}: no x-arbitrum-go; run node scripts/extract-go-definitions.ts`);
  }
  const mapper = new TypeMapper(doc, id);
  const response = op.responses['200'].content['application/json'].schema as Json;
  const result = mapper.resolve((response.oneOf as Json[])[0]).properties.result as Json;

  return { go, result: resultRows(mapper, result) };
}
