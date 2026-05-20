import React, { isValidElement, ReactNode } from 'react';
import OriginalCodeBlock from '@theme-original/CodeBlock';
import { CodeWalkthrough } from '@site/src/components/InteractiveTutorials';
import { metastringHasWalkthrough } from '@site/src/components/InteractiveTutorials/codeWalkthroughParser';

function maybeStringifyChildren(children: ReactNode): ReactNode {
  if (React.Children.toArray(children).some((element) => isValidElement(element))) {
    return children;
  }

  return Array.isArray(children) ? children.join('') : children;
}

export default function CodeBlock({ children: rawChildren, ...props }: any): JSX.Element {
  const children = maybeStringifyChildren(rawChildren);

  if (typeof children === 'string' && metastringHasWalkthrough(props.metastring)) {
    return <CodeWalkthrough {...props}>{children}</CodeWalkthrough>;
  }

  return <OriginalCodeBlock {...props}>{rawChildren}</OriginalCodeBlock>;
}
