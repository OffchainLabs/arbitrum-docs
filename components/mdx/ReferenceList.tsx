import { getMDXComponents } from '@/components/mdx';
import { type ReferenceCollectionName, listReferences } from '@/lib/references';

import './reference-list.css';

/**
 * Renders an entire reference collection as a definition list, sorted by `sortAs`, each entry with an
 * `#id` anchor. Backs index pages like the glossary. Server component — definitions render as MDX.
 */
export function ReferenceList({ collection }: { collection: ReferenceCollectionName }) {
  const components = getMDXComponents();
  return (
    <div className="reference-list">
      {listReferences(collection).map((entry) => {
        const Definition = entry.body;
        return (
          <section key={entry.id} id={entry.id} className="reference-list__item">
            <h3 className="reference-list__term">{entry.title}</h3>
            <Definition components={components} />
          </section>
        );
      })}
    </div>
  );
}
