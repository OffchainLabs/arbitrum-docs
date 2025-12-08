import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { LidiaDiagramConfig } from './types';
import { useLidiaState } from './hooks/useLidiaState';

interface LidiaDiagramProps {
  config: LidiaDiagramConfig;
}

export default function LidiaDiagram({ config }: LidiaDiagramProps) {
  const { currentState, navigateToState, goBack, canGoBack } = useLidiaState(config);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevStateIdRef = useRef<string | null>(null);
  const transitioningRef = useRef(false);

  const handleNavigation = useCallback(
    (nextStateId: string) => {
      if (!transitioningRef.current) {
        transitioningRef.current = true;
        setIsTransitioning(true);
        navigateToState(nextStateId);
      }
    },
    [navigateToState],
  );

  const handleBackClick = useCallback(() => {
    if (!transitioningRef.current) {
      transitioningRef.current = true;
      setIsTransitioning(true);
      goBack();
    }
  }, [goBack]);

  useEffect(() => {
    if (!currentState || !containerRef.current) return;

    // Skip if we're still showing the same state
    if (prevStateIdRef.current === currentState.id) return;

    const loadAndSetupSvg = async () => {
      try {
        const response = await fetch(currentState.svgPath);
        const svgText = await response.text();

        // Create a new div for the incoming SVG
        const newSvgDiv = document.createElement('div');
        newSvgDiv.className = 'lidia-svg-wrapper';
        newSvgDiv.innerHTML = svgText;

        const svg = newSvgDiv.querySelector('svg');
        if (!svg) return;

        // Set up clickable areas
        currentState.clickableAreas.forEach((area) => {
          const element = svg.querySelector(area.selector);
          if (!element) return;

          element.classList.add('lidia-clickable');

          if (area.tooltip) {
            element.setAttribute('title', area.tooltip);
          }

          element.addEventListener('click', () => {
            handleNavigation(area.nextStateId);
          });
        });

        // Handle transition
        const existingWrapper = containerRef.current.querySelector('.lidia-svg-wrapper');

        if (existingWrapper && prevStateIdRef.current !== null) {
          // Crossfade effect
          newSvgDiv.classList.add('lidia-svg-wrapper-entering');
          containerRef.current.appendChild(newSvgDiv);

          // Force reflow
          void newSvgDiv.offsetHeight;

          // Start transition
          requestAnimationFrame(() => {
            existingWrapper.classList.add('lidia-fade-out');
            newSvgDiv.classList.remove('lidia-svg-wrapper-entering');
            newSvgDiv.classList.add('lidia-fade-in');

            // Clean up after transition
            setTimeout(() => {
              existingWrapper.remove();
              transitioningRef.current = false;
              setIsTransitioning(false);
            }, 600);
          });
        } else {
          // Initial load
          if (existingWrapper) existingWrapper.remove();
          containerRef.current.appendChild(newSvgDiv);
          transitioningRef.current = false;
          setIsTransitioning(false);
        }

        // Update the previous state reference
        prevStateIdRef.current = currentState.id;
      } catch (error) {
        console.error('Error loading SVG:', error);
        transitioningRef.current = false;
        setIsTransitioning(false);
      }
    };

    loadAndSetupSvg();
  }, [currentState, handleNavigation]);

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
            onClick={handleBackClick}
            aria-label="Go back to previous state"
            disabled={isTransitioning}
          >
            ← Back
          </button>
        )}
      </div>
      <div ref={containerRef} className="lidia-svg-container" />
    </div>
  );
}
