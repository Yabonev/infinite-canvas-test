import { describe, it, expect, beforeEach } from 'vitest';
import { ViewportManager, Point, Bounds } from '../ViewportManager';

describe('ViewportManager', () => {
  let canvas: HTMLCanvasElement;
  let viewport: ViewportManager;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    viewport = new ViewportManager(canvas);
  });

  describe('coordinate conversion', () => {
    it('should convert screen to world coordinates at default zoom', () => {
      const screenPoint: Point = { x: 400, y: 300 };
      const worldPoint = viewport.screenToWorld(screenPoint);
      expect(worldPoint).toEqual({ x: 400, y: 300 });
    });

    it('should convert world to screen coordinates at default zoom', () => {
      const worldPoint: Point = { x: 100, y: 200 };
      const screenPoint = viewport.worldToScreen(worldPoint);
      expect(screenPoint).toEqual({ x: 100, y: 200 });
    });

    it('should handle zoom in coordinate conversion', () => {
      viewport.setViewport({ x: 0, y: 0, zoom: 2 });
      const screenPoint: Point = { x: 400, y: 300 };
      const worldPoint = viewport.screenToWorld(screenPoint);
      expect(worldPoint).toEqual({ x: 200, y: 150 });
    });

    it('should handle pan in coordinate conversion', () => {
      viewport.setViewport({ x: 100, y: 50, zoom: 1 });
      const screenPoint: Point = { x: 400, y: 300 };
      const worldPoint = viewport.screenToWorld(screenPoint);
      expect(worldPoint).toEqual({ x: 300, y: 250 });
    });
  });

  describe('panning', () => {
    it('should pan the viewport', () => {
      viewport.pan(50, -25);
      const vp = viewport.getViewport();
      expect(vp.x).toBe(50);
      expect(vp.y).toBe(-25);
    });

    it('should accumulate pan operations', () => {
      viewport.pan(10, 20);
      viewport.pan(30, 40);
      const vp = viewport.getViewport();
      expect(vp.x).toBe(40);
      expect(vp.y).toBe(60);
    });
  });

  describe('zooming', () => {
    it('should zoom at center point', () => {
      const centerPoint: Point = { x: 400, y: 300 };
      viewport.zoomAt(centerPoint, 2);
      const vp = viewport.getViewport();
      expect(vp.zoom).toBe(2);
      expect(vp.x).toBe(-400);
      expect(vp.y).toBe(-300);
    });

    it('should zoom at offset point', () => {
      const offsetPoint: Point = { x: 200, y: 150 };
      viewport.zoomAt(offsetPoint, 2);
      const vp = viewport.getViewport();
      expect(vp.zoom).toBe(2);
      expect(vp.x).toBe(-200);
      expect(vp.y).toBe(-150);
    });

    it('should clamp zoom to minimum value', () => {
      viewport.setViewport({ x: 0, y: 0, zoom: 1 });
      viewport.zoomAt({ x: 0, y: 0 }, 0.01);
      const vp = viewport.getViewport();
      expect(vp.zoom).toBe(0.1);
    });

    it('should clamp zoom to maximum value', () => {
      viewport.setViewport({ x: 0, y: 0, zoom: 1 });
      viewport.zoomAt({ x: 0, y: 0 }, 10);
      const vp = viewport.getViewport();
      expect(vp.zoom).toBe(5);
    });
  });

  describe('viewport bounds', () => {
    it('should calculate viewport bounds at default state', () => {
      const bounds = viewport.getViewportBounds();
      expect(bounds).toEqual({
        x: 0,
        y: 0,
        width: 800,
        height: 600
      });
    });

    it('should calculate viewport bounds with zoom', () => {
      viewport.setViewport({ x: 0, y: 0, zoom: 2 });
      const bounds = viewport.getViewportBounds();
      expect(bounds).toEqual({
        x: 0,
        y: 0,
        width: 400,
        height: 300
      });
    });

    it('should calculate viewport bounds with pan', () => {
      viewport.setViewport({ x: 100, y: 50, zoom: 1 });
      const bounds = viewport.getViewportBounds();
      expect(bounds).toEqual({
        x: -100,
        y: -50,
        width: 800,
        height: 600
      });
    });
  });

  describe('visibility', () => {
    it('should detect visible bounds', () => {
      const visibleBounds: Bounds = { x: 100, y: 100, width: 100, height: 100 };
      expect(viewport.isVisible(visibleBounds)).toBe(true);
    });

    it('should detect invisible bounds', () => {
      const invisibleBounds: Bounds = { x: 1000, y: 1000, width: 100, height: 100 };
      expect(viewport.isVisible(invisibleBounds)).toBe(false);
    });

    it('should handle margin in visibility check', () => {
      const bounds: Bounds = { x: 790, y: 590, width: 10, height: 10 };
      expect(viewport.isVisible(bounds, 10)).toBe(true);
      expect(viewport.isVisible(bounds, 0)).toBe(true);
    });
  });

  describe('viewport state', () => {
    it('should get and set viewport state', () => {
      const newViewport = { x: 123, y: 456, zoom: 2.5 };
      viewport.setViewport(newViewport);
      expect(viewport.getViewport()).toEqual(newViewport);
    });

    it('should return a copy of viewport state', () => {
      const vp1 = viewport.getViewport();
      vp1.x = 999;
      const vp2 = viewport.getViewport();
      expect(vp2.x).toBe(0);
    });
  });
});