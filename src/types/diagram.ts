export interface DiagramElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'class' | 'method' | 'interface';
  connections: string[];
}

export interface NavigationState {
  selectedId: string | null;
  mode: 'select' | 'create' | 'connect';
  focusHistory: string[];
}