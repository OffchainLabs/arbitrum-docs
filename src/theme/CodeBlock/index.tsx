import { CodeWalkthrough } from '@site/src/components/InteractiveTutorials';
import { metastringHasWalkthrough } from '@site/src/components/InteractiveTutorials/codeWalkthroughParser';
import OriginalCodeBlock from '@theme-original/CodeBlock';
import React, { ReactNode, isValidElement } from 'react';

function maybeStringifyChildren(children: ReactNode): ReactNode {
  if (React.Children.toArray(children).some((element) => isValidElement(element))) {
    return children;
  }

  return Array.isArray(children) ? children.join('') : children;
}

export default function CodeBlock({ children: rawChildren, ...props }: any): React.ReactElement {
  const children = maybeStringifyChildren(rawChildren);

  if (typeof children === 'string' && metastringHasWalkthrough(props.metastring)) {
    return <CodeWalkthrough {...props}>{children}</CodeWalkthrough>;
  }

  return <OriginalCodeBlock {...props}>{rawChildren}</OriginalCodeBlock>;
}
