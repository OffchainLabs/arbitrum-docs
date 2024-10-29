import React from 'react';

export default function Glossary({ glossaryJsonData }) {
  return (
    <div>
      {Object.entries(glossaryJsonData).map(([key, item]) => (
        <div key={key}>
          <h3 id={key}>{item.title} {`{#${key}}`}</h3>
          <div dangerouslySetInnerHTML={{ __html: item.text }} />
        </div>
      ))}
    </div>
  );
}
