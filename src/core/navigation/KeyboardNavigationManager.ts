/**
 * Comprehensive keyboard navigation system for infinite canvas diagrams
 * Supports spatial navigation, shortcuts, and mode switching
 */

import { DiagramElement, NavigationState } from '../../types/diagram';
import { ViewportManager } from '../viewport/ViewportManager';

export class KeyboardNavigationManager {
  private state: NavigationState = {
    selectedId: null,
    mode: 'select',
    focusHistory: []
  };

  private elements: Map<string, DiagramElement> = new Map();
  private shortcuts: Map<string, () => void> = new Map();
  private viewport: ViewportManager;

  constructor(viewport: ViewportManager) {
    this.viewport = viewport;
    this.setupKeyboardShortcuts();
    this.bindEvents();
  }

  private setupKeyboardShortcuts() {
    // Navigation shortcuts
    this.shortcuts.set('Tab', () => this.navigateNext());
    this.shortcuts.set('Shift+Tab', () => this.navigatePrevious());
    this.shortcuts.set('ArrowLeft', () => this.navigateSpatial('left'));
    this.shortcuts.set('ArrowRight', () => this.navigateSpatial('right'));
    this.shortcuts.set('ArrowUp', () => this.navigateSpatial('up'));
    this.shortcuts.set('ArrowDown', () => this.navigateSpatial('down'));

    // Vim-style navigation
    this.shortcuts.set('h', () => this.navigateSpatial('left'));
    this.shortcuts.set('l', () => this.navigateSpatial('right'));
    this.shortcuts.set('k', () => this.navigateSpatial('up'));
    this.shortcuts.set('j', () => this.navigateSpatial('down'));

    // Movement shortcuts
    this.shortcuts.set('Shift+ArrowLeft', () => this.moveSelected(-10, 0));
    this.shortcuts.set('Shift+ArrowRight', () => this.moveSelected(10, 0));
    this.shortcuts.set('Shift+ArrowUp', () => this.moveSelected(0, -10));
    this.shortcuts.set('Shift+ArrowDown', () => this.moveSelected(0, 10));

    // Creation shortcuts
    this.shortcuts.set('c', () => this.createClass());
    this.shortcuts.set('m', () => this.createMethod());
    this.shortcuts.set('i', () => this.createInterface());
    this.shortcuts.set('Enter', () => this.createConnected());

    // Connection shortcuts
    this.shortcuts.set('Ctrl+Enter', () => this.startConnection());
    this.shortcuts.set('Escape', () => this.cancelConnection());

    // Utility shortcuts
    this.shortcuts.set('f', () => this.focusOnSelected());
    this.shortcuts.set('g', () => this.goToElement());
    this.shortcuts.set('Delete', () => this.deleteSelected());
    this.shortcuts.set('Backspace', () => this.deleteSelected());
    this.shortcuts.set('Home', () => this.goHome());

    // Zoom shortcuts
    this.shortcuts.set('Ctrl+=', () => this.zoomIn());
    this.shortcuts.set('Ctrl+-', () => this.zoomOut());
    this.shortcuts.set('Ctrl+0', () => this.zoomToFit());

    // Mode shortcuts
    this.shortcuts.set('s', () => this.setMode('select'));
    this.shortcuts.set('n', () => this.setMode('create'));
    this.shortcuts.set('r', () => this.setMode('connect'));
  }

  private bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (this.isInputActive()) return; // Don't interfere with text input

      const shortcut = this.getShortcut(e);
      const handler = this.shortcuts.get(shortcut);

      if (handler) {
        e.preventDefault();
        handler();
      }
    });
  }

  private getShortcut(e: KeyboardEvent): string {
    const parts: string[] = [];

    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');

    // Handle special keys
    if (e.key === 'Tab') parts.push('Tab');
    else if (e.key.startsWith('Arrow')) parts.push(e.key);
    else if (['Enter', 'Escape', 'Delete', 'Backspace', 'Home'].includes(e.key)) {
      parts.push(e.key);
    } else if (e.key === '+' || e.key === '=') {
      parts.push('=');
    } else if (e.key === '-') {
      parts.push('-');
    } else if (e.key === '0') {
      parts.push('0');
    } else {
      parts.push(e.key.toLowerCase());
    }

    return parts.join('+');
  }

  private isInputActive(): boolean {
    const active = document.activeElement;
    return active instanceof HTMLInputElement ||
           active instanceof HTMLTextAreaElement ||
           (active && active.getAttribute('contenteditable') === 'true');
  }

  // Spatial navigation - find nearest element in direction
  private navigateSpatial(direction: 'left' | 'right' | 'up' | 'down') {
    if (!this.state.selectedId) {
      this.selectFirst();
      return;
    }

    const current = this.elements.get(this.state.selectedId);
    if (!current) return;

    const candidates: Array<{ id: string; element: DiagramElement; distance: number }> = [];

    for (const [id, element] of this.elements) {
      if (id === this.state.selectedId) continue;

      const isInDirection = this.isInDirection(current, element, direction);
      if (!isInDirection) continue;

      const distance = this.calculateDistance(current, element);
      candidates.push({ id, element, distance });
    }

    if (candidates.length === 0) return;

    // Sort by distance and select closest
    candidates.sort((a, b) => a.distance - b.distance);
    this.selectElement(candidates[0].id);
  }

  private isInDirection(
    from: DiagramElement,
    to: DiagramElement,
    direction: string
  ): boolean {
    const threshold = 30; // Pixels of overlap tolerance

    switch (direction) {
      case 'left':
        return to.x + to.width < from.x + threshold &&
               Math.abs(to.y + to.height/2 - from.y - from.height/2) < from.height/2 + threshold;
      case 'right':
        return to.x > from.x + from.width - threshold &&
               Math.abs(to.y + to.height/2 - from.y - from.height/2) < from.height/2 + threshold;
      case 'up':
        return to.y + to.height < from.y + threshold &&
               Math.abs(to.x + to.width/2 - from.x - from.width/2) < from.width/2 + threshold;
      case 'down':
        return to.y > from.y + from.height - threshold &&
               Math.abs(to.x + to.width/2 - from.x - from.width/2) < from.width/2 + threshold;
      default:
        return false;
    }
  }

  private calculateDistance(from: DiagramElement, to: DiagramElement): number {
    const fromCenter = { x: from.x + from.width/2, y: from.y + from.height/2 };
    const toCenter = { x: to.x + to.width/2, y: to.y + to.height/2 };

    return Math.sqrt(
      Math.pow(toCenter.x - fromCenter.x, 2) +
      Math.pow(toCenter.y - fromCenter.y, 2)
    );
  }

  private navigateNext() {
    const elements = Array.from(this.elements.keys());
    if (elements.length === 0) return;

    if (!this.state.selectedId) {
      this.selectElement(elements[0]);
      return;
    }

    const currentIndex = elements.indexOf(this.state.selectedId);
    const nextIndex = (currentIndex + 1) % elements.length;
    this.selectElement(elements[nextIndex]);
  }

  private navigatePrevious() {
    const elements = Array.from(this.elements.keys());
    if (elements.length === 0) return;

    if (!this.state.selectedId) {
      this.selectElement(elements[elements.length - 1]);
      return;
    }

    const currentIndex = elements.indexOf(this.state.selectedId);
    const prevIndex = (currentIndex - 1 + elements.length) % elements.length;
    this.selectElement(elements[prevIndex]);
  }

  private selectFirst() {
    const elements = Array.from(this.elements.keys());
    if (elements.length > 0) {
      this.selectElement(elements[0]);
    }
  }

  private selectElement(id: string) {
    this.state.selectedId = id;
    this.state.focusHistory = this.state.focusHistory.filter(i => i !== id);
    this.state.focusHistory.push(id);

    // Limit history size
    if (this.state.focusHistory.length > 10) {
      this.state.focusHistory.shift();
    }

    this.onSelectionChange?.(id);
  }

  private moveSelected(deltaX: number, deltaY: number) {
    if (!this.state.selectedId) return;

    const element = this.elements.get(this.state.selectedId);
    if (!element) return;

    element.x += deltaX;
    element.y += deltaY;

    this.onElementMove?.(this.state.selectedId, element);
  }

  private createClass() {
    const position = this.getCreationPosition();
    const id = this.generateId('class');

    const element: DiagramElement = {
      id,
      x: position.x,
      y: position.y,
      width: 120,
      height: 80,
      type: 'class',
      connections: []
    };

    this.elements.set(id, element);
    this.selectElement(id);
    this.onElementCreate?.(element);
  }

  private createMethod() {
    const position = this.getCreationPosition();
    const id = this.generateId('method');

    const element: DiagramElement = {
      id,
      x: position.x,
      y: position.y,
      width: 100,
      height: 60,
      type: 'method',
      connections: []
    };

    this.elements.set(id, element);
    this.selectElement(id);
    this.onElementCreate?.(element);
  }

  private createInterface() {
    const position = this.getCreationPosition();
    const id = this.generateId('interface');

    const element: DiagramElement = {
      id,
      x: position.x,
      y: position.y,
      width: 140,
      height: 70,
      type: 'interface',
      connections: []
    };

    this.elements.set(id, element);
    this.selectElement(id);
    this.onElementCreate?.(element);
  }

  private createConnected() {
    if (!this.state.selectedId) {
      this.createClass();
      return;
    }

    const parent = this.elements.get(this.state.selectedId);
    if (!parent) return;

    const id = this.generateId('class');
    const element: DiagramElement = {
      id,
      x: parent.x + 200,
      y: parent.y,
      width: 120,
      height: 80,
      type: 'class',
      connections: []
    };

    // Create bidirectional connection
    parent.connections.push(id);
    element.connections.push(parent.id);

    this.elements.set(id, element);
    this.selectElement(id);
    this.onElementCreate?.(element);
    this.onConnectionCreate?.(parent.id, id);
  }

  private getCreationPosition() {
    if (this.state.selectedId) {
      const selected = this.elements.get(this.state.selectedId);
      if (selected) {
        return { x: selected.x + 200, y: selected.y };
      }
    }

    // Use viewport center
    const viewportBounds = this.viewport.getViewportBounds();
    return {
      x: viewportBounds.x + viewportBounds.width / 2 - 60,
      y: viewportBounds.y + viewportBounds.height / 2 - 40
    };
  }

  private focusOnSelected() {
    if (!this.state.selectedId) return;

    const element = this.elements.get(this.state.selectedId);
    if (!element) return;

    this.viewport.focusOnBounds({
      x: element.x - 50,
      y: element.y - 50,
      width: element.width + 100,
      height: element.height + 100
    });
  }

  private deleteSelected() {
    if (!this.state.selectedId) return;

    // Remove connections
    const element = this.elements.get(this.state.selectedId);
    if (element) {
      element.connections.forEach(connectedId => {
        const connected = this.elements.get(connectedId);
        if (connected) {
          connected.connections = connected.connections.filter(id => id !== this.state.selectedId);
        }
      });
    }

    const wasSelected = this.state.selectedId;
    this.elements.delete(this.state.selectedId);
    this.onElementDelete?.(this.state.selectedId);

    // Select next element
    this.navigateNext();
    if (this.state.selectedId === wasSelected) {
      this.state.selectedId = null;
      this.onSelectionChange?.(null);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setMode(mode: NavigationState['mode']) {
    this.state.mode = mode;
    this.onModeChange?.(mode);
  }

  private zoomIn() {
    const center = {
      x: this.viewport.canvas.width / 2,
      y: this.viewport.canvas.height / 2
    };
    this.viewport.zoomAt(center, 1.2);
  }

  private zoomOut() {
    const center = {
      x: this.viewport.canvas.width / 2,
      y: this.viewport.canvas.height / 2
    };
    this.viewport.zoomAt(center, 0.8);
  }

  private zoomToFit() {
    if (this.elements.size === 0) return;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const element of this.elements.values()) {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    }

    this.viewport.focusOnBounds({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    });
  }

  private goHome() {
    this.viewport.setViewport({ x: 0, y: 0, zoom: 1 });
  }

  // Placeholder methods for connection (not implemented yet)
  private startConnection() {
    // TODO: Implement connection mode
  }

  private cancelConnection() {
    // TODO: Implement connection cancel
  }

  private goToElement() {
    // TODO: Implement go to element by name/id
  }

  // Event callbacks (implement these in your application)
  onSelectionChange?: (id: string) => void;
  onElementCreate?: (element: DiagramElement) => void;
  onElementMove?: (id: string, element: DiagramElement) => void;
  onElementDelete?: (id: string) => void;
  onConnectionCreate?: (fromId: string, toId: string) => void;
  onModeChange?: (mode: NavigationState['mode']) => void;

  // Public API
  addElement(element: DiagramElement) {
    this.elements.set(element.id, element);
  }

  removeElement(id: string) {
    this.elements.delete(id);
    if (this.state.selectedId === id) {
      this.state.selectedId = null;
    }
  }

  getSelectedId(): string | null {
    return this.state.selectedId;
  }

  getState(): NavigationState {
    return { ...this.state };
  }

  getAllElements(): DiagramElement[] {
    return Array.from(this.elements.values());
  }
}