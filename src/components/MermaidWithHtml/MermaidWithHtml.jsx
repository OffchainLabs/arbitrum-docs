// see /src/pages/mermaid-with-html for a usage demo that renders to https://developer.arbitrum.io/mermaid-with-html

import React, { useEffect, useRef, createContext } from 'react';
import './MermaidWithHtml.css';
import mermaid from 'mermaid';

const MermaidContext = createContext(null);

// <MermaidWithHtml> is the top-level component that wraps the entire HTML-like diagram specification
const MermaidWithHtml = ({ children }) => {
  const [todo] = React.useState(null);
  return (
    <MermaidContext.Provider value={{ todo }}>
      <div className="mermaid-with-html">{children}</div>
    </MermaidContext.Provider>
  );
};

// This is used to generate the mermaid code from the <Node> and <Connection> blocks
const generateMermaidCodeFromHtmlNodesAndConnections = (htmlNodes, connections, title) => {
  // todo: magic string, could make this configurable. TB = top to bottom, LR = left to right, etc.
  const graphType = 'TB';
  const usedNodeIds = new Set();

  const graphCode = connections
    .map((conn) => {
      const fromHtmlNode = htmlNodes.find((node) => node.props.id === conn.props.from);
      const toHtmlNode = htmlNodes.find((node) => node.props.id === conn.props.to);

      const fromHtmlNodeId = fromHtmlNode.props.id;
      const fromHtmlNodeText = fromHtmlNode.props.children;
      const toHtmlNodeId = toHtmlNode.props.id;
      const toHtmlNodeText = toHtmlNode.props.children;

      // If the node ID is already used, then we don't need to add the text; applies to both from and to nodes
      const fromMermaidNode = usedNodeIds.has(fromHtmlNodeId)
        ? fromHtmlNodeId
        : `${fromHtmlNodeId}("${fromHtmlNodeText}")`;

      const toMermaidNode = usedNodeIds.has(toHtmlNodeId)
        ? toHtmlNodeId
        : `${toHtmlNodeId}("${toHtmlNodeText}")`;

      usedNodeIds.add(fromHtmlNodeId);
      usedNodeIds.add(toHtmlNodeId);

      let mermaidLine;

      // handle connection labels
      const connectionLabel = conn.props.label;

      if (connectionLabel) {
        mermaidLine = `${fromMermaidNode} -. ${connectionLabel} .-> ${toMermaidNode}`;
      } else {
        mermaidLine = `${fromMermaidNode} -.-> ${toMermaidNode}`;
      }

      // todo: line and arrow types could be configurable too

      return mermaidLine;
    })
    .join('\n  ');

  let mermaidCode = `graph ${graphType}\n${graphCode}`;

  // handle title
  if (title) {
    mermaidCode = `---\ntitle: ${title}\n---\n\n${mermaidCode}`;
  }
  return mermaidCode;
};

// <Nodes> is the wrapper around the mermaid diagram itself
const Nodes = ({ children, title }) => {
  const containerRef = useRef(null);
  const childArray = React.Children.toArray(children);

  const htmlNodes = childArray.filter(
    (child) => React.isValidElement(child) && child.type === Node,
  );

  const connections = childArray.filter(
    (child) => React.isValidElement(child) && child.type === Connection,
  );

  const code = generateMermaidCodeFromHtmlNodesAndConnections(htmlNodes, connections, title);

  useEffect(() => {
    mermaid.init(undefined, containerRef.current);

    // trying to get the "hover & highlight" effect to work, low priority
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const svg = containerRef.current.querySelector('svg');
          if (svg) {
            svg.querySelectorAll('.nodes .node').forEach((node, index) => {
              node.setAttribute('data-index', index + 1);
            });
          }
        }
      });
    });

    const observerConfig = { attributes: false, childList: true, subtree: false };
    observer.observe(containerRef.current, observerConfig);

    return () => {
      observer.disconnect();
    };
  }, [code]);

  return (
    <div className="mermaid" ref={containerRef}>
      {code}
    </div>
  );
};

const NodeDescriptions = ({ children }) => {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.childNodes.forEach((nodeInfo) => {
        // todo: wire up highlighting here
        nodeInfo.classList.add('node-description');
      });
    }
  }, []);

  return (
    <ol className="node-description-list" ref={listRef}>
      {children}
    </ol>
  );
};

const NodeDescription = ({ children }) => {
  const nodeRef = useRef(null);
  return (
    <div className="node-info" ref={nodeRef}>
      {children}
    </div>
  );
};

const Node = ({ id, children }) => <div data-node-id={id}>{children}</div>;
const Connection = ({ from, to }) => (
  <div data-connection-from={from} data-connection-to={to}></div>
);

export { MermaidWithHtml, NodeDescription, NodeDescriptions, Nodes, Node, Connection };
