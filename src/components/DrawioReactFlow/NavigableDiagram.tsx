import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow, Node as RFNode, Viewport } from 'reactflow';
import { useColorMode } from '@docusaurus/theme-common';
import { motion, AnimatePresence } from 'motion/react';
import 'reactflow/dist/style.css';
import { ClickableNode } from './ClickableNode';
import { SubgraphNode } from './SubgraphNode';
import { ImageNode } from './ImageNode';
import { HoverEdge } from './HoverEdge';
import { DiagramModal } from './DiagramModal';
import { convertDiagramToReactFlow } from './utils/convertDiagram';
import { fetchAndParseManifest } from './utils/parseManifest';
import { ReactFlowData, DiagramProps, NodeData, ManifestData, TransitionConfig } from './types';

function useSafeColorMode() {
  try {
    const { colorMode } = useColorMode();
    return colorMode;
  } catch (error) {
    return 'light';
  }
}

function DiagramFlow({
  flowData,
  nodeTypes,
  edgeTypes,
  defaultEdgeOptions,
  onDiagramNavigate,
  onModalRequest,
  transitions,
}: {
  flowData: ReactFlowData;
  nodeTypes: Record<string, React.ComponentType<any>>;
  edgeTypes: Record<string, React.ComponentType<any>>;
  defaultEdgeOptions: Record<string, any>;
  onDiagramNavigate?: (diagramPath: string) => void;
  onModalRequest?: (transition: TransitionConfig) => void;
  transitions?: TransitionConfig[];
}) {
  const { setCenter, setViewport, getViewport } = useReactFlow();
  const viewportHistory = useRef<Viewport[]>([]);
  const pendingNavTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    return () => {
      if (pendingNavTimer.current !== null) {
        clearTimeout(pendingNavTimer.current);
      }
    };
  }, []);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: RFNode<NodeData>) => {
      if (!node.data?.centerable) return;

      const transConfig = transitions?.find((t) => t.trigger === node.data?.label);

      if (transConfig?.mode === 'modal' && onModalRequest) {
        onModalRequest(transConfig);
        return;
      }

      viewportHistory.current.push(getViewport());
      setCanGoBack(true);

      const nodeWidth = (node.style?.width as number) || node.width || 100;
      const nodeHeight = (node.style?.height as number) || node.height || 50;
      const x = node.position.x + nodeWidth / 2;
      const y = node.position.y + nodeHeight / 2;

      const zoomLevel = transConfig?.zoom.level ?? 4;
      const zoomDuration = transConfig?.zoom.duration ?? 1600;
      const pauseDuration = transConfig?.pause.duration ?? 200;

      setCenter(x, y, { zoom: zoomLevel, duration: zoomDuration });

      if (pendingNavTimer.current !== null) {
        clearTimeout(pendingNavTimer.current);
        pendingNavTimer.current = null;
      }

      if (node.data?.navigateTo && onDiagramNavigate) {
        pendingNavTimer.current = setTimeout(() => {
          pendingNavTimer.current = null;
          onDiagramNavigate(node.data.navigateTo!);
        }, zoomDuration + pauseDuration);
      }
    },
    [setCenter, getViewport, onDiagramNavigate, onModalRequest, transitions],
  );

  const handleGoBack = useCallback(() => {
    if (pendingNavTimer.current !== null) {
      clearTimeout(pendingNavTimer.current);
      pendingNavTimer.current = null;
    }
    const prev = viewportHistory.current.pop();
    if (prev) {
      setViewport(prev, { duration: 1600 });
    }
    setCanGoBack(viewportHistory.current.length > 0);
  }, [setViewport]);

  return (
    <>
      {canGoBack && (
        <div className="diagram-nav-controls">
          <button
            className="back-button"
            onClick={handleGoBack}
            aria-label="Go back to previous view"
          >
            <span className="back-icon">&larr;</span>
            Go back
          </button>
        </div>
      )}
      <ReactFlow
        nodes={flowData.nodes}
        edges={flowData.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={handleNodeClick}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 5,
        }}
        attributionPosition="bottom-right"
      />
    </>
  );
}

export function NavigableDiagram({
  diagramFile,
  manifest,
  height,
  className = '',
  hoverContent,
}: DiagramProps) {
  const colorMode = useSafeColorMode();
  const [flowData, setFlowData] = useState<ReactFlowData>({ nodes: [], edges: [] });
  const [currentDiagram, setCurrentDiagram] = useState<string>('');
  const [manifestData, setManifestData] = useState<ManifestData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalTransition, setModalTransition] = useState<TransitionConfig | null>(null);

  const handleModalRequest = useCallback((transition: TransitionConfig) => {
    setModalTransition(transition);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalTransition(null);
  }, []);

  const nodeTypes = useMemo(
    () => ({ custom: ClickableNode, group: SubgraphNode, image: ImageNode }),
    [],
  );

  const edgeTypes = useMemo(() => ({ hoverEdge: HoverEdge }), []);

  const defaultEdgeOptions = useMemo(
    () => ({
      style: { strokeWidth: 1.5, stroke: 'rgba(18, 170, 255, 0.6)' },
      animated: false,
    }),
    [],
  );

  const currentTransitions = useMemo(() => {
    if (!manifestData) return undefined;
    return manifestData.transitions.filter((t) => t.fromFile === currentDiagram);
  }, [manifestData, currentDiagram]);

  const handleNavigate = useCallback(
    (link: string) => {
      setHistory((prev) => [...prev, currentDiagram]);
      setCurrentDiagram(link);
    },
    [currentDiagram],
  );

  const handleBack = useCallback(() => {
    if (history.length > 0) {
      const previousDiagram = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentDiagram(previousDiagram);
    }
  }, [history]);

  useEffect(() => {
    if (!manifest) {
      if (diagramFile) setCurrentDiagram(diagramFile);
      return;
    }
    const loadManifest = async () => {
      try {
        const data = await fetchAndParseManifest(manifest);
        setManifestData(data);
        setCurrentDiagram(data.entryDiagramFile);
      } catch (err) {
        console.error('Error loading manifest:', err);
        setError(err instanceof Error ? err.message : 'Failed to load manifest');
        setLoading(false);
      }
    };
    loadManifest();
  }, [manifest, diagramFile]);

  useEffect(() => {
    if (!currentDiagram) return;

    const controller = new AbortController();

    const loadDiagram = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(currentDiagram, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load diagram: ${currentDiagram}`);
        }
        const rawContent = await response.text();
        const data = await convertDiagramToReactFlow(
          rawContent,
          currentDiagram,
          handleNavigate,
          currentTransitions,
        );
        if (!controller.signal.aborted) {
          // Resolve hover content components onto nodes and edges
          if (hoverContent) {
            for (const node of data.nodes) {
              if (node.data?.hoverContentKey && hoverContent[node.data.hoverContentKey]) {
                node.data.hoverContentComponent = hoverContent[node.data.hoverContentKey];
              }
            }
            for (const edge of data.edges) {
              const edgeData = edge.data as any;
              if (edgeData?.hoverContentKey && hoverContent[edgeData.hoverContentKey]) {
                edgeData.hoverContentComponent = hoverContent[edgeData.hoverContentKey];
              }
            }
          }
          setFlowData(data);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Error loading diagram:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    loadDiagram();

    return () => {
      controller.abort();
    };
  }, [currentDiagram, handleNavigate, manifestData, hoverContent]);

  if (loading) {
    return (
      <div
        className={`drawio-reactflow-container ${className}`}
        style={{
          ...(height ? { height } : {}),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>Loading diagram...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`drawio-reactflow-container ${className}`}
        style={{
          ...(height ? { height } : {}),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: 'var(--ifm-color-danger)' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className={`drawio-reactflow-container ${className}`}
      data-theme={colorMode}
      style={{ ...(height ? { height } : {}), position: 'relative' }}
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
            duration: 1.5,
            ease: 'easeInOut',
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ReactFlowProvider>
            <DiagramFlow
              flowData={flowData}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              onDiagramNavigate={handleNavigate}
              onModalRequest={handleModalRequest}
              transitions={currentTransitions}
            />
          </ReactFlowProvider>
        </motion.div>
      </AnimatePresence>
      {modalTransition && (
        <DiagramModal
          diagramFile={modalTransition.targetFile}
          title={modalTransition.trigger}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
