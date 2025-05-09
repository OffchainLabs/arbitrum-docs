import * as React from 'react';
import { Modal } from './Modal';
import Button from './Button';
import { PictureWithClickableNumbersProps } from './types';
import { coordinates as defaultCoordinates } from './constants';
import DefaultBackground from './DefaultBackground';

/**
 * Enhanced FlowChart component that supports dynamic modal content loading
 * for the PictureWithClickableNumbers diagram.
 */
export const FlowChartWithDynamicModals: React.FC<
  PictureWithClickableNumbersProps & { diagramId?: string }
> = (props) => {
  const {
    id = 'default',
    backgroundImagePath,
    svgFilePath, // For backward compatibility
    isSvgBackground = true,
    viewBox = '0 0 1600 900',
    backgroundElements,
    numbers = [1, 2, 3, 4, 5],
    style,
    className,
    customCoordinates,
    diagramId = 'centralized-auction', // Default diagram ID
    ...svgProps
  } = props;

  // For backward compatibility: use svgFilePath if backgroundImagePath is not provided
  const finalBackgroundPath = backgroundImagePath || svgFilePath;

  // If a custom SVG file path is provided, load it
  const [svgContent, setSvgContent] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (finalBackgroundPath && isSvgBackground) {
      fetch(finalBackgroundPath)
        .then((response) => response.text())
        .then((data) => {
          setSvgContent(data);
        })
        .catch((error) => {
          console.error('Error loading SVG file:', error);
        });
    }
  }, [finalBackgroundPath, isSvgBackground]);

  // Use custom coordinates if provided, otherwise use default
  const finalCoordinates = customCoordinates
    ? { ...defaultCoordinates, ...customCoordinates }
    : defaultCoordinates;

  // Case 1: Static image background (non-SVG)
  if (finalBackgroundPath && !isSvgBackground) {
    return (
      <div className={className} style={{ position: 'relative', ...style }}>
        <img
          src={finalBackgroundPath}
          alt="Background"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={viewBox}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          {...svgProps}
        >
          {numbers.map((number) => {
            const isDynamic = props.dynamicButtons?.includes(number);
            const isAnimated = props.animatedButtons?.includes(number);
            return (
              <Modal
                key={`${id}-${number}`}
                number={number}
                coordinates={finalCoordinates}
                id={id}
                diagramId={diagramId}
              >
                <Button
                  number={number}
                  type={isDynamic ? 'dynamic' : 'static'}
                  animated={isAnimated}
                  coordinates={finalCoordinates}
                  id={id}
                />
              </Modal>
            );
          })}
          {backgroundElements}
        </svg>
      </div>
    );
  }

  // Case 2: Custom SVG background
  if (finalBackgroundPath && isSvgBackground) {
    return (
      <div className={className} style={{ position: 'relative', ...style }}>
        {svgContent ? (
          <div dangerouslySetInnerHTML={{ __html: svgContent }} style={{ pointerEvents: 'none' }} />
        ) : (
          <div>Loading SVG...</div>
        )}
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={viewBox}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          {...svgProps}
        >
          {numbers.map((number) => {
            const isDynamic = props.dynamicButtons?.includes(number);
            const isAnimated = props.animatedButtons?.includes(number);
            return (
              <Modal
                key={`${id}-${number}`}
                number={number}
                coordinates={finalCoordinates}
                id={id}
                diagramId={diagramId}
              >
                <Button
                  number={number}
                  type={isDynamic ? 'dynamic' : 'static'}
                  animated={isAnimated}
                  coordinates={finalCoordinates}
                  id={id}
                />
              </Modal>
            );
          })}
          {backgroundElements}
        </svg>
      </div>
    );
  }

  // Case 3: Default SVG background (built-in)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="svg415"
      viewBox={viewBox}
      style={{ pointerEvents: 'none', ...style }}
      className={className}
      {...svgProps}
    >
      {/* Render the default background */}
      <DefaultBackground viewBox={viewBox} />

      {/* Render the numbered elements */}
      {numbers.map((number) => {
        const isDynamic = props.dynamicButtons?.includes(number);
        const isAnimated = props.animatedButtons?.includes(number);
        return (
          <Modal
            key={`${id}-${number}`}
            number={number}
            coordinates={finalCoordinates}
            id={id}
            diagramId={diagramId}
          >
            <Button
              number={number}
              type={isDynamic ? 'dynamic' : 'static'}
              animated={isAnimated}
              coordinates={finalCoordinates}
              id={id}
            />
          </Modal>
        );
      })}
      {backgroundElements}
    </svg>
  );
};
