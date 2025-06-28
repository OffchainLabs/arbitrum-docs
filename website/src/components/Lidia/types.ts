export interface ClickableArea {
  id: string;
  selector: string;
  nextStateId: string;
  tooltip?: string;
}

export interface DiagramState {
  id: string;
  svgPath: string;
  clickableAreas: ClickableArea[];
}

export interface LidiaDiagramConfig {
  id: string;
  title: string;
  states: DiagramState[];
  initialStateId: string;
}

export interface LidiaState {
  currentStateId: string;
  history: string[];
}