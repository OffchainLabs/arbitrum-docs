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
 * This component renders the complete SVG diagram showing the centralized auction process.
 * It includes interactive numbered steps (2, 3, and 4) that can be clicked to display
 * detailed information in modal dialogs.
 *
 * @param props - Props for the SVG component, including custom SVG file path
 * @returns An SVG element containing the complete diagram with interactive elements
 */
export const FlowChart: React.FC<PictureWithClickableNumbersProps> = (props) => {
  const {
    id = 'default',
    svgFilePath,
    viewBox = '0 0 1600 900',
    backgroundElements,
    numbers = [1, 2, 3, 4, 5],
    style,
    className,
    customCoordinates,
    ...svgProps
  } = props;
  // If a custom SVG file path is provided, use it as the background
  const [svgContent, setSvgContent] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (svgFilePath) {
      fetch(svgFilePath)
        .then((response) => response.text())
        .then((data) => {
          setSvgContent(data);
        })
        .catch((error) => {
          console.error('Error loading SVG file:', error);
        });
    }
  }, [svgFilePath]);

  // Use custom coordinates if provided, otherwise use default
  const finalCoordinates = customCoordinates
    ? { ...defaultCoordinates, ...customCoordinates }
    : defaultCoordinates;

  // If using custom SVG, render it with numbered elements on top
  if (svgFilePath) {
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
          {numbers.map((number) => (
            <Modal key={`${id}-${number}`} number={number} coordinates={finalCoordinates} id={id}>
              <Button number={number} type="dynamic" coordinates={finalCoordinates} id={id} />
            </Modal>
          ))}
          {backgroundElements}
        </svg>
      </div>
    );
  }

  // If no SVG file path is provided, use the default SVG
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
      {numbers.map((number) => (
        <Modal key={`${id}-${number}`} number={number} coordinates={finalCoordinates} id={id}>
          <Button number={number} type="dynamic" coordinates={finalCoordinates} id={id} />
        </Modal>
      ))}
      {backgroundElements}
    </svg>
  );
};
