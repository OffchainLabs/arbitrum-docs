import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow from 'reactflow';
import { useColorMode } from '@docusaurus/theme-common';
import { motion, AnimatePresence } from 'motion/react';
import 'reactflow/dist/style.css';
import { ClickableNode } from './ClickableNode';
import { SubgraphNode } from './SubgraphNode';
import { convertMermaidToReactFlow } from './utils/mermaidToReactFlow';
import { ReactFlowData, MermaidReactFlowProps } from './types';

// Safe hook to handle context not being available during hydration
function useSafeColorMode() {
  try {
    const { colorMode } = useColorMode();
    return colorMode;
  } catch (error) {
    // Fallback to light mode if context is not available
    return 'light';
  }
}

export function NavigableDiagram({
  diagramFile,
  height = '500px',
  className = '',
}: MermaidReactFlowProps) {
  const colorMode = useSafeColorMode();
  const [flowData, setFlowData] = useState<ReactFlowData>({ nodes: [], edges: [] });
  const [currentDiagram, setCurrentDiagram] = useState<string>(diagramFile);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom node types
  const nodeTypes = useMemo(() => ({ custom: ClickableNode, group: SubgraphNode }), []);

  // Handle navigation to a new diagram
  const handleNavigate = useCallback(
    (link: string) => {
      // Add current diagram to history
      setHistory((prev) => [...prev, currentDiagram]);
      setCurrentDiagram(link);
    },
    [currentDiagram],
  );

  // Handle back button
  const handleBack = useCallback(() => {
    if (history.length > 0) {
      const previousDiagram = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentDiagram(previousDiagram);
    }
  }, [history]);

  // Load diagram from file
  useEffect(() => {
    const loadDiagram = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the .mmd file
        const response = await fetch(currentDiagram);
        if (!response.ok) {
          throw new Error(`Failed to load diagram: ${currentDiagram}`);
        }

        const mermaidCode = await response.text();

        // Convert to React Flow
        const data = await convertMermaidToReactFlow(mermaidCode, handleNavigate);
        setFlowData(data);
      } catch (err) {
        console.error('Error loading diagram:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadDiagram();
  }, [currentDiagram, handleNavigate]);

  if (loading) {
    return (
      <div
        className={`mermaid-reactflow-container ${className}`}
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div>Loading diagram...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`mermaid-reactflow-container ${className}`}
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ color: 'var(--ifm-color-danger)' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className={`mermaid-reactflow-container ${className}`}
      data-theme={colorMode}
      style={{ height, position: 'relative' }}
    >
      {history.length > 0 && (
        <div className="diagram-nav-controls">
          <button
            className="back-button"
            onClick={handleBack}
            aria-label="Go back to previous diagram"
          >
            <span className="back-icon">←</span>
            Back
          </button>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDiagram}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: {
              duration: 1.5,
              ease: 'easeInOut',
            },
            exit: {
              duration: 2.2,
              ease: 'easeOut',
            },
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ReactFlow
            nodes={flowData.nodes}
            edges={flowData.edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
              includeHiddenNodes: false,
              minZoom: 0.5,
              maxZoom: 1.5,
            }}
            attributionPosition="bottom-right"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
