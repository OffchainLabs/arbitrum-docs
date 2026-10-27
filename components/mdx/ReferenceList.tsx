import { getMDXComponents } from '@/components/mdx';
import { type ReferenceCollectionName, listReferences } from '@/lib/references';

/**
 * Renders an entire reference collection as a definition list, sorted by `sortAs`, each entry with an
 * `#id` anchor. Backs index pages like the glossary. Async server component; definitions compile
 * on demand and render as MDX. `mb-2!` is important because the unlayered `.prose` heading margins
 * in app/global.css would otherwise beat a layered utility.
 */
export async function ReferenceList({ collection }: { collection: ReferenceCollectionName }) {
  const components = getMDXComponents();
  const entries = await Promise.all(
    listReferences(collection).map(async (entry) => ({ entry, ...(await entry.load()) })),
  );
  return (
    <div>
      {entries.map(({ entry, body: Definition }) => {
        return (
          <section key={entry.id} id={entry.id} className="mb-6 scroll-mt-24 border-b pb-4">
            <h3 className="mb-2!">{entry.title}</h3>
            <Definition components={components} />
          </section>
        );
      })}
    </div>
  );
}
