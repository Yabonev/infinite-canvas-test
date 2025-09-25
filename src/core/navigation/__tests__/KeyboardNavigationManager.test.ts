import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardNavigationManager } from '../KeyboardNavigationManager';
import { ViewportManager } from '../../viewport/ViewportManager';
import { DiagramElement } from '../../../types/diagram';

// Mock ViewportManager
const mockViewport = {
  canvas: { width: 800, height: 600 },
  getViewportBounds: vi.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
  focusOnBounds: vi.fn(),
  setViewport: vi.fn(),
  zoomAt: vi.fn(),
} as any;

describe('KeyboardNavigationManager', () => {
  let navManager: KeyboardNavigationManager;

  beforeEach(() => {
    // Create a mock canvas for ViewportManager
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const viewport = new ViewportManager(canvas);

    navManager = new KeyboardNavigationManager(viewport);
  });

  describe('element management', () => {
    it('should add and retrieve elements', () => {
      const element: DiagramElement = {
        id: 'test-class',
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        type: 'class',
        connections: []
      };

      navManager.addElement(element);
      const elements = navManager.getAllElements();

      expect(elements).toHaveLength(1);
      expect(elements[0]).toEqual(element);
    });

    it('should remove elements', () => {
      const element: DiagramElement = {
        id: 'test-class',
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        type: 'class',
        connections: []
      };

      navManager.addElement(element);
      navManager.removeElement('test-class');

      const elements = navManager.getAllElements();
      expect(elements).toHaveLength(0);
    });

    it('should select elements', () => {
      const element: DiagramElement = {
        id: 'test-class',
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        type: 'class',
        connections: []
      };

      navManager.addElement(element);
      navManager['selectElement']('test-class'); // Access private method for testing

      expect(navManager.getSelectedId()).toBe('test-class');
    });
  });

  describe('spatial navigation', () => {
    let element1: DiagramElement;
    let element2: DiagramElement;
    let element3: DiagramElement;

    beforeEach(() => {
      element1 = {
        id: 'elem1',
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        type: 'class',
        connections: []
      };

      element2 = {
        id: 'elem2',
        x: 250,
        y: 100,
        width: 120,
        height: 80,
        type: 'class',
        connections: []
      };

      element3 = {
        id: 'elem3',
        x: 100,
        y: 200,
        width: 120,
        height: 80,
        type: 'class',
        connections: []
      };

      navManager.addElement(element1);
      navManager.addElement(element2);
      navManager.addElement(element3);
    });

    it('should navigate to the right element', () => {
      navManager['selectElement']('elem1');
      navManager['navigateSpatial']('right');

      expect(navManager.getSelectedId()).toBe('elem2');
    });

    it('should navigate down', () => {
      navManager['selectElement']('elem1');
      navManager['navigateSpatial']('down');

      expect(navManager.getSelectedId()).toBe('elem3');
    });

    it('should not navigate left from leftmost element', () => {
      navManager['selectElement']('elem1');
      navManager['navigateSpatial']('left');

      expect(navManager.getSelectedId()).toBe('elem1');
    });
  });

  describe('sequential navigation', () => {
    beforeEach(() => {
      const element1: DiagramElement = {
        id: 'elem1',
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        type: 'class',
        connections: []
      };

      const element2: DiagramElement = {
        id: 'elem2',
        x: 250,
        y: 100,
        width: 120,
        height: 80,
        type: 'class',
        connections: []
      };

      navManager.addElement(element1);
      navManager.addElement(element2);
    });

    it('should navigate to next element with Tab', () => {
      navManager['navigateNext']();
      expect(navManager.getSelectedId()).toBe('elem1');

      navManager['navigateNext']();
      expect(navManager.getSelectedId()).toBe('elem2');

      navManager['navigateNext']();
      expect(navManager.getSelectedId()).toBe('elem1');
    });

    it('should navigate to previous element with Shift+Tab', () => {
      navManager['selectElement']('elem2');
      navManager['navigatePrevious']();
      expect(navManager.getSelectedId()).toBe('elem1');
    });
  });

  describe('element creation', () => {
    it('should create a class element', () => {
      let createdElement: DiagramElement | undefined;

      navManager.onElementCreate = (element) => {
        createdElement = element;
      };

      navManager['createClass']();

      expect(createdElement).toBeDefined();
      expect(createdElement?.type).toBe('class');
      expect(createdElement?.width).toBe(120);
      expect(createdElement?.height).toBe(80);
    });

    it('should create a method element', () => {
      let createdElement: DiagramElement | undefined;

      navManager.onElementCreate = (element) => {
        createdElement = element;
      };

      navManager['createMethod']();

      expect(createdElement).toBeDefined();
      expect(createdElement?.type).toBe('method');
      expect(createdElement?.width).toBe(100);
      expect(createdElement?.height).toBe(60);
    });

    it('should create connected element', () => {
      const parent: DiagramElement = {
        id: 'parent',
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        type: 'class',
        connections: []
      };

      navManager.addElement(parent);
      navManager['selectElement']('parent');

      let createdElement: DiagramElement | undefined;
      let connectionCreated = false;

      navManager.onElementCreate = (element) => {
        createdElement = element;
      };

      navManager.onConnectionCreate = (from, to) => {
        if (from === 'parent' && to === createdElement?.id) {
          connectionCreated = true;
        }
      };

      navManager['createConnected']();

      expect(createdElement).toBeDefined();
      expect(createdElement?.x).toBe(300); // parent.x + 200
      expect(createdElement?.y).toBe(100);
      expect(connectionCreated).toBe(true);
    });
  });

  describe('state management', () => {
    it('should maintain navigation state', () => {
      const state = navManager.getState();
      expect(state.selectedId).toBeNull();
      expect(state.mode).toBe('select');
      expect(state.focusHistory).toEqual([]);
    });

    it('should update mode', () => {
      let newMode: string | undefined;

      navManager.onModeChange = (mode) => {
        newMode = mode;
      };

      navManager['setMode']('create');

      expect(newMode).toBe('create');
      expect(navManager.getState().mode).toBe('create');
    });
  });
});