export interface Coordinates {
  circle: {
    x: number;
    y: number;
  };
  path: {
    x: number;
    y: number;
  };
  offset?: {
    x: number;
    y: number;
  };
}

export interface NumberComponentProps {
  number: 0 | 1 | 2 | 3 | 4 | 5;
  type?: 'static' | 'dynamic';
  animated?: boolean;
  interactive?: boolean;
  coordinates: Record<
    number,
    {
      circle: { x: number; y: number };
      path: { x: number; y: number };
      offset?: { x: number; y: number };
    }
  >;
  id?: string;
  onHover?: (isHovered: boolean) => void;
}

export interface SyntaxHighlighterProps {
  language: string;
  style: Record<string, unknown>;
  customStyle?: React.CSSProperties;
  children: string;
}

export interface PictureWithClickableNumbersProps {
  /**
   * Unique identifier for this diagram instance
   * Required when using multiple diagrams on the same page
   */
  id?: string;

  /**
   * Path to SVG or image file to use as background
   * If not provided, the default SVG defined in the component will be used
   * For static images, use a path from /website/static/img/
   */
  backgroundImagePath?: string;

  /**
   * Path to SVG file to use as background (DEPRECATED: use backgroundImagePath instead)
   * @deprecated Use backgroundImagePath instead
   */
  svgFilePath?: string;

  /**
   * Whether the background is an SVG (true) or static image (false)
   * @default true
   */
  isSvgBackground?: boolean;

  /**
   * Custom SVG viewBox dimensions
   * @default "0 0 1600 900"
   */
  viewBox?: string;

  /**
   * Custom background SVG elements
   */
  backgroundElements?: React.ReactNode;

  /**
   * Custom numbered elements to display
   * @default [1, 2, 3, 4, 5]
   */
  numbers?: Array<1 | 2 | 3 | 4 | 5>;

  /**
   * Custom styling for the SVG container
   */
  style?: React.CSSProperties;

  /**
   * Custom class name for the SVG container
   */
  className?: string;

  /**
   * Custom coordinates for the numbered elements
   * If provided, these will override the default coordinates
   */
  customCoordinates?: {
    [key in 1 | 2 | 3 | 4 | 5]?: {
      circle: {
        x: number;
        y: number;
      };
      path: {
        x: number;
        y: number;
      };
      offset?: {
        x: number;
        y: number;
      };
    };
  };
}

export interface ModalContentProps {
  /**
   * The step number associated with this content
   */
  number: 1 | 2 | 3 | 4 | 5;

  /**
   * The title to display in the modal header
   */
  title: string;

  /**
   * The content to display in the modal body
   */
  children: React.ReactNode;
}
