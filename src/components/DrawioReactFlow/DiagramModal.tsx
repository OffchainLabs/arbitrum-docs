import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import { motion, AnimatePresence } from 'motion/react';
import { ClickableNode } from './ClickableNode';
import { SubgraphNode } from './SubgraphNode';
import { ImageNode } from './ImageNode';
import { HoverEdge } from './HoverEdge';
import { convertDiagramToReactFlow } from './utils/convertDiagram';
import { ReactFlowData } from './types';

interface DiagramModalProps {
  diagramFile: string;
  title?: string;
  onClose: () => void;
}

const nodeTypes = { custom: ClickableNode, group: SubgraphNode, image: ImageNode };
const edgeTypes = { hoverEdge: HoverEdge };
const defaultEdgeOptions = {
  style: { strokeWidth: 1.5, stroke: 'rgba(18, 170, 255, 0.6)' },
  animated: false,
};

export function DiagramModal({ diagramFile, title, onClose }: DiagramModalProps) {
  const [flowData, setFlowData] = useState<ReactFlowData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(diagramFile, { signal: controller.signal });
        if (!response.ok) throw new Error(`Failed to load diagram: ${diagramFile}`);
        const rawContent = await response.text();
        // Nested navigation is disabled inside the modal — pass a no-op handler.
        const data = await convertDiagramToReactFlow(
          rawContent,
          diagramFile,
          () => undefined,
          undefined,
        );
        if (!controller.signal.aborted) setFlowData(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [diagramFile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    closeButtonRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="diagram-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="presentation"
      >
        <motion.div
          key="modal"
          className="diagram-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title ?? 'Diagram detail'}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="diagram-modal__header">
            {title && <h2 className="diagram-modal__title">{title}</h2>}
            <button
              ref={closeButtonRef}
              type="button"
              className="diagram-modal__close"
              onClick={onClose}
              aria-label="Close diagram"
            >
              ×
            </button>
          </div>
          <div className="diagram-modal__body">
            {loading && <div className="diagram-modal__status">Loading diagram…</div>}
            {error && (
              <div className="diagram-modal__status diagram-modal__status--error">
                Error: {error}
              </div>
            )}
            {!loading && !error && (
              <ReactFlowProvider>
                <ReactFlow
                  nodes={flowData.nodes}
                  edges={flowData.edges}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  defaultEdgeOptions={defaultEdgeOptions}
                  zoomOnScroll
                  zoomOnPinch
                  zoomOnDoubleClick
                  fitView
                  fitViewOptions={{
                    padding: 0.2,
                    includeHiddenNodes: false,
                    minZoom: 0.5,
                    maxZoom: 5,
                  }}
                  attributionPosition="bottom-right"
                />
              </ReactFlowProvider>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
