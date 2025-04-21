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
  number: 1 | 2 | 3 | 4 | 5;
}

export interface ButtonComponentProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SyntaxHighlighterProps {
  language: string;
  style: Record<string, unknown>;
  customStyle?: React.CSSProperties;
  children: string;
}

export interface PictureWithClickableNumbersProps {
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
