import React, { useEffect, useRef } from 'react';
import type { LidiaDiagramConfig } from './types';
import { useLidiaState } from './hooks/useLidiaState';

interface LidiaDiagramProps {
  config: LidiaDiagramConfig;
}

export default function LidiaDiagram({ config }: LidiaDiagramProps) {
  const { currentState, navigateToState, goBack, canGoBack } = useLidiaState(config);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentState || !svgContainerRef.current) return;

    const loadAndSetupSvg = async () => {
      try {
        const response = await fetch(currentState.svgPath);
        const svgText = await response.text();

        svgContainerRef.current!.innerHTML = svgText;

        const svg = svgContainerRef.current!.querySelector('svg');
        if (!svg) return;

        currentState.clickableAreas.forEach((area) => {
          const element = svg.querySelector(area.selector);
          if (!element) return;

          element.classList.add('lidia-clickable');

          if (area.tooltip) {
            element.setAttribute('title', area.tooltip);
          }

          element.addEventListener('click', () => {
            navigateToState(area.nextStateId);
          });
        });
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };

    loadAndSetupSvg();
  }, [currentState, navigateToState]);

  if (!currentState) {
    return <div className="lidia-error">Error: Invalid diagram state</div>;
  }

  return (
    <div className="lidia-container">
      <div className="lidia-header">
        <h3 className="lidia-title">{config.title}</h3>
        {canGoBack && (
          <button
            className="lidia-back-button"
            onClick={goBack}
            aria-label="Go back to previous state"
          >
            ← Back
          </button>
        )}
      </div>
      <div ref={svgContainerRef} className="lidia-svg-container" />
    </div>
  );
}
