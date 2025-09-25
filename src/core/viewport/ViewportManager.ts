/**
 * Core viewport system for infinite canvas implementation
 * Handles camera transformation, zoom, and coordinate conversion
 */

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ViewportManager {
  private viewport: Viewport = { x: 0, y: 0, zoom: 1 };
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenPoint: Point): Point {
    return {
      x: (screenPoint.x - this.viewport.x) / this.viewport.zoom,
      y: (screenPoint.y - this.viewport.y) / this.viewport.zoom
    };
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldPoint: Point): Point {
    return {
      x: worldPoint.x * this.viewport.zoom + this.viewport.x,
      y: worldPoint.y * this.viewport.zoom + this.viewport.y
    };
  }

  // Pan the viewport by screen pixels
  pan(deltaX: number, deltaY: number) {
    this.viewport.x += deltaX;
    this.viewport.y += deltaY;
  }

  // Zoom at a specific screen point
  zoomAt(screenPoint: Point, zoomFactor: number) {
    const worldPoint = this.screenToWorld(screenPoint);

    this.viewport.zoom *= zoomFactor;
    this.viewport.zoom = Math.max(0.1, Math.min(5, this.viewport.zoom)); // Clamp zoom

    const newScreenPoint = this.worldToScreen(worldPoint);
    this.viewport.x += screenPoint.x - newScreenPoint.x;
    this.viewport.y += screenPoint.y - newScreenPoint.y;
  }

  // Focus on a specific world bounds with animation
  focusOnBounds(bounds: Bounds, padding = 50, duration = 600) {
    const targetZoom = Math.min(
      (this.canvas.width - padding * 2) / bounds.width,
      (this.canvas.height - padding * 2) / bounds.height
    );

    const targetX = this.canvas.width / 2 - (bounds.x + bounds.width / 2) * targetZoom;
    const targetY = this.canvas.height / 2 - (bounds.y + bounds.height / 2) * targetZoom;

    this.animateViewport({ x: targetX, y: targetY, zoom: targetZoom }, duration);
  }

  // Animate viewport transition
  private animateViewport(target: Viewport, duration: number) {
    const start = { ...this.viewport };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      this.viewport.x = start.x + (target.x - start.x) * easeOut;
      this.viewport.y = start.y + (target.y - start.y) * easeOut;
      this.viewport.zoom = start.zoom + (target.zoom - start.zoom) * easeOut;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Apply viewport transform to canvas context
  applyTransform() {
    this.ctx.save();
    this.ctx.setTransform(
      this.viewport.zoom, 0,
      0, this.viewport.zoom,
      this.viewport.x, this.viewport.y
    );
  }

  // Restore canvas context
  restoreTransform() {
    this.ctx.restore();
  }

  // Check if world bounds are visible in viewport
  isVisible(bounds: Bounds, margin = 0): boolean {
    const screenBounds = {
      x: bounds.x * this.viewport.zoom + this.viewport.x - margin,
      y: bounds.y * this.viewport.zoom + this.viewport.y - margin,
      width: bounds.width * this.viewport.zoom + margin * 2,
      height: bounds.height * this.viewport.zoom + margin * 2
    };

    return screenBounds.x < this.canvas.width &&
           screenBounds.y < this.canvas.height &&
           screenBounds.x + screenBounds.width > 0 &&
           screenBounds.y + screenBounds.height > 0;
  }

  // Get current viewport bounds in world coordinates
  getViewportBounds(): Bounds {
    const topLeft = this.screenToWorld({ x: 0, y: 0 });
    const bottomRight = this.screenToWorld({
      x: this.canvas.width,
      y: this.canvas.height
    });

    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    };
  }

  // Get current viewport state
  getViewport(): Viewport {
    return { ...this.viewport };
  }

  // Set viewport state
  setViewport(viewport: Viewport) {
    this.viewport = { ...viewport };
  }
}