// see src/pages/mermaid-with-html.md for usage example
import React, { useEffect, useRef, createContext } from 'react';
import './MermaidWithHtml.css';
import mermaid from 'mermaid';

const MermaidContext = createContext(null);


const MermaidWithHtml = ({ children }) => {
  const [todo] = React.useState(null);
  return (
    <MermaidContext.Provider value={{ todo }}>
      <div className="mermaid-with-html">{children}</div>
    </MermaidContext.Provider>
  );
};

const NodeDescriptions = ({ children }) => {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.childNodes.forEach((nodeInfo) => {
        // todo: wire up highlighting here
        nodeInfo.classList.add("node-description");
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
  return <div className="node-info" ref={nodeRef}>{children}</div>;
};

const Nodes = ({ children }) => {
  const containerRef = useRef(null);

  const htmlNodes = children.filter((child) => child.props.mdxType == "Node");
  const connections = children.filter((child) => child.props.mdxType == "Connection");

  const code = generateMermaidCodeFromHtmlNodesAndConnections(htmlNodes, connections);

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

  return <div className="mermaid" ref={containerRef}>{code}</div>;
};

const Node = ({ id, children }) => <div data-node-id={id}>{children}</div>;
const Connection = ({ from, to }) => (<div data-connection-from={from} data-connection-to={to}></div>);

const generateMermaidCodeFromHtmlNodesAndConnections = (htmlNodes, connections) => {

  // todo: magic string, could make this configurable
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

      const fromMermaidNode = usedNodeIds.has(fromHtmlNodeId)
        ? fromHtmlNodeId
        : `${fromHtmlNodeId}("${fromHtmlNodeText}")`;

      const toMermaidNode = usedNodeIds.has(toHtmlNodeId)
        ? toHtmlNodeId
        : `${toHtmlNodeId}("${toHtmlNodeText}")`;

      usedNodeIds.add(fromHtmlNodeId);
      usedNodeIds.add(toHtmlNodeId);

      // line and arrow types could be configurable too
      return `${fromMermaidNode} -.-> ${toMermaidNode}`;
    })
    .join('\n  ');

  return `graph ${graphType}\n${graphCode}`;
};

export { MermaidWithHtml, NodeDescription, NodeDescriptions, Nodes, Node, Connection };