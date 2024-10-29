import React from 'react';
import { glossaryJsonData } from '@site/static/glossary.json';

export default function Glossary({ glossaryJsonData }) {
  return (
    <div>
      {Object.entries(glossaryJsonData).map(([key, item]) => (
        <div key={key}>
          <h3 id={key}>{item.title} </h3>
          <div dangerouslySetInnerHTML={{ __html: item.text }} />
        </div>
      ))}
    </div>
  );
}
