import * as React from 'react';
import { Modal } from './Modal';
import Button from './Button';
import { PictureWithClickableNumbersProps } from './types';
import { coordinates as defaultCoordinates } from './constants';
import DefaultBackground from './DefaultBackground';

/**
 * Main export for the PictureWithClickableNumbers diagram component.
 *
 * @param props - The component props
 * @returns The complete PictureWithClickableNumbers diagram component
 */
export default function PictureWithClickableNumbers(
  props: PictureWithClickableNumbersProps,
): JSX.Element {
  return <FlowChart {...props} />;
}

/**
 * FlowChart component for the PictureWithClickableNumbers diagram.
 *
 * @remarks
 * This component renders an interactive diagram with clickable numbered elements.
 * It supports three background modes:
 * 1. Default SVG background (built-in)
 * 2. Custom SVG background (loaded from a file)
 * 3. Static image background (from /website/static/img/)
 *
 * @param props - Props for the SVG component, including custom background options
 * @returns An element containing the complete diagram with interactive elements
 */
export const FlowChart: React.FC<PictureWithClickableNumbersProps> = (props) => {
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
              <Modal key={`${id}-${number}`} number={number} coordinates={finalCoordinates} id={id}>
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
              <Modal key={`${id}-${number}`} number={number} coordinates={finalCoordinates} id={id}>
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
          <Modal key={`${id}-${number}`} number={number} coordinates={finalCoordinates} id={id}>
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
