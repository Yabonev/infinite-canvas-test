# Deep Dive: Canvas Rendering Engines for Infinite Canvas

**Last updated:** 2025-09-25

## Problem Fit and Decision Criteria

For an infinite canvas diagramming application with keyboard-only navigation, rendering engine choice affects:

- **Performance** with 100+ shapes and smooth interactions
- **Development complexity** for infinite canvas viewport system
- **Keyboard navigation** integration and focus management
- **Shape rendering quality** and visual effects
- **Animation smoothness** for camera transitions

## Approach 1: Canvas2D with Konva.js

### Minimal Working Example

```typescript
// Basic infinite canvas with Konva.js
import Konva from 'konva';

class InfiniteCanvas {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private viewport = { x: 0, y: 0, scale: 1 };
  
  constructor(container: HTMLElement) {
    this.stage = new Konva.Stage({
      container: container.id,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    
    this.setupKeyboardNavigation();
    this.setupWheel();
  }
  
  private setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      const panSpeed = 20;
      const zoomFactor = 1.1;
      
      switch(e.code) {
        case 'ArrowLeft':
          this.pan(-panSpeed, 0);
          break;
        case 'ArrowRight':
          this.pan(panSpeed, 0);
          break;
        case 'ArrowUp':
          this.pan(0, -panSpeed);
          break;
        case 'ArrowDown':
          this.pan(0, panSpeed);
          break;
        case 'Equal': // Plus key
          if (e.ctrlKey) this.zoom(zoomFactor);
          break;
        case 'Minus':
          if (e.ctrlKey) this.zoom(1/zoomFactor);
          break;
      }
    });
  }
  
  private pan(deltaX: number, deltaY: number) {
    this.viewport.x += deltaX;
    this.viewport.y += deltaY;
    this.updateTransform();
  }
  
  private zoom(factor: number) {
    this.viewport.scale *= factor;
    this.updateTransform();
  }
  
  private updateTransform() {
    this.layer.position(this.viewport);
    this.layer.scale({ x: this.viewport.scale, y: this.viewport.scale });
  }
  
  addShape(config: any) {
    const shape = new Konva.Rect({
      width: 100,
      height: 60,
      fill: 'lightblue',
      stroke: 'blue',
      strokeWidth: 2,
      ...config
    });
    this.layer.add(shape);
    return shape;
  }
}

// Usage
const canvas = new InfiniteCanvas(document.getElementById('container'));
canvas.addShape({ x: 100, y: 100 });
canvas.addShape({ x: 300, y: 200 });
```

### Architecture Notes

**Coordinate System**: Konva uses a transform matrix system where the layer position and scale affect all child shapes. The infinite canvas is achieved by:

1. **Viewport Transform**: Layer position represents camera position
2. **Zoom Scale**: Layer scale affects all child elements uniformly  
3. **World Coordinates**: Shapes maintain absolute positions regardless of viewport

**Performance Optimizations**:
- Viewport culling with `stage.getIntersection()`
- Layer caching for static content
- Event delegation through Konva's built-in system

### Integration Steps

1. **Install Dependencies**
```bash
npm install konva
npm install --save-dev @types/konva  # for TypeScript
```

2. **Setup Base Structure**
```typescript
// Create infinite canvas manager class
// Implement viewport transformation system
// Add keyboard event handling
// Create shape management system
```

3. **Implement Shape System**
```typescript
interface DiagramShape {
  id: string;
  type: 'rectangle' | 'circle' | 'diamond';
  position: { x: number; y: number };
  size: { width: number; height: number };
  connections: string[];
}
```

4. **Add Connection System**
```typescript
class ConnectionSystem {
  private arrows: Konva.Arrow[] = [];
  
  createConnection(from: DiagramShape, to: DiagramShape) {
    const arrow = new Konva.Arrow({
      points: [from.position.x, from.position.y, to.position.x, to.position.y],
      pointerLength: 10,
      pointerWidth: 10,
      fill: 'black',
      stroke: 'black'
    });
    return arrow;
  }
}
```

### Edge Cases and Failure Modes

- **Large Scale Issues**: Canvas2D performance degrades with >1000 complex shapes
- **High-DPI Display**: Requires proper scaling for retina displays
- **Memory Management**: Need to clean up shapes when off-viewport
- **Touch Conflicts**: Touch events may interfere with keyboard navigation

### Performance Considerations

**Strengths**:
- Good balance of performance and ease of use
- Hardware-accelerated through browser canvas
- Mature API with extensive documentation

**Limitations**:
- Single-threaded rendering
- CPU-bound for complex shapes
- No native GPU acceleration for effects

### When NOT to Use This

- Applications requiring >1000 simultaneously visible shapes
- Complex visual effects needing GPU shaders  
- Real-time data visualization with high update frequency
- Mobile-first applications (touch interactions primary)

---

## Approach 2: WebGL with PixiJS

### Minimal Working Example

```typescript
import * as PIXI from 'pixi.js';

class PixiInfiniteCanvas {
  private app: PIXI.Application;
  private viewport: PIXI.Container;
  private camera = { x: 0, y: 0, scale: 1 };
  
  constructor(container: HTMLElement) {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      backgroundColor: 0xffffff
    });
    
    container.appendChild(this.app.view as HTMLCanvasElement);
    
    this.viewport = new PIXI.Container();
    this.app.stage.addChild(this.viewport);
    
    this.setupKeyboardNavigation();
  }
  
  private setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      const panSpeed = 20 / this.camera.scale; // Scale-adjusted panning
      
      switch(e.code) {
        case 'ArrowLeft':
          this.camera.x -= panSpeed;
          break;
        case 'ArrowRight':
          this.camera.x += panSpeed;
          break;
        case 'ArrowUp':
          this.camera.y -= panSpeed;
          break;
        case 'ArrowDown':
          this.camera.y += panSpeed;
          break;
        case 'Equal':
          if (e.ctrlKey) this.zoomAt(this.app.screen.width/2, this.app.screen.height/2, 1.1);
          break;
        case 'Minus':
          if (e.ctrlKey) this.zoomAt(this.app.screen.width/2, this.app.screen.height/2, 0.9);
          break;
      }
      this.updateViewport();
    });
  }
  
  private zoomAt(x: number, y: number, factor: number) {
    const worldPoint = { 
      x: (x - this.viewport.x) / this.viewport.scale.x,
      y: (y - this.viewport.y) / this.viewport.scale.y
    };
    
    this.camera.scale *= factor;
    this.camera.x = x - worldPoint.x * this.camera.scale;
    this.camera.y = y - worldPoint.y * this.camera.scale;
  }
  
  private updateViewport() {
    this.viewport.position.set(this.camera.x, this.camera.y);
    this.viewport.scale.set(this.camera.scale);
  }
  
  addShape(x: number, y: number, type: 'rectangle' | 'circle' = 'rectangle') {
    const graphics = new PIXI.Graphics();
    
    if (type === 'rectangle') {
      graphics.beginFill(0x3498db);
      graphics.drawRect(0, 0, 100, 60);
    } else {
      graphics.beginFill(0xe74c3c);
      graphics.drawCircle(0, 0, 30);
    }
    
    graphics.position.set(x, y);
    graphics.interactive = true;
    graphics.cursor = 'pointer';
    
    this.viewport.addChild(graphics);
    return graphics;
  }
}
```

### Architecture Notes

**WebGL Pipeline**: PixiJS abstracts WebGL complexity while providing:
- GPU-accelerated rendering for all graphics operations
- Batch rendering for optimal performance
- Shader support for advanced visual effects
- Texture management and optimization

**Performance Characteristics**:
- Handles 10,000+ sprites smoothly
- Sub-pixel rendering precision
- Hardware-accelerated filters and effects
- Efficient memory management through object pooling

### Performance Considerations

**Strengths**:
- Exceptional performance with large datasets
- GPU acceleration for all operations
- Advanced visual effects capabilities
- Mature WebGL abstraction

**Limitations**:
- Larger bundle size and complexity
- WebGL compatibility concerns on older devices
- Steeper learning curve for team adoption
- Potential overkill for simple diagrams

---

## Approach 3: Native Canvas2D Implementation

### Minimal Working Example

```typescript
class NativeInfiniteCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera = { x: 0, y: 0, scale: 1 };
  private shapes: Shape[] = [];
  
  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    container.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d')!;
    this.setupKeyboardNavigation();
    this.render();
  }
  
  private setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      const panSpeed = 20;
      
      switch(e.code) {
        case 'ArrowLeft': this.camera.x -= panSpeed; break;
        case 'ArrowRight': this.camera.x += panSpeed; break;
        case 'ArrowUp': this.camera.y -= panSpeed; break;
        case 'ArrowDown': this.camera.y += panSpeed; break;
        case 'Equal': 
          if (e.ctrlKey) this.camera.scale *= 1.1; 
          break;
        case 'Minus': 
          if (e.ctrlKey) this.camera.scale /= 1.1; 
          break;
      }
      this.render();
    });
  }
  
  private render() {
    // Clear canvas
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    
    // Apply camera transform
    this.ctx.save();
    this.ctx.translate(this.camera.x, this.camera.y);
    this.ctx.scale(this.camera.scale, this.camera.scale);
    
    // Render shapes
    for (const shape of this.shapes) {
      this.renderShape(shape);
    }
    
    this.ctx.restore();
  }
  
  private renderShape(shape: Shape) {
    this.ctx.fillStyle = shape.color;
    this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
    this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  }
  
  addShape(x: number, y: number, width = 100, height = 60) {
    this.shapes.push({ x, y, width, height, color: '#3498db' });
    this.render();
  }
}

interface Shape {
  x: number; y: number; width: number; height: number; color: string;
}
```

### Implementation Strategy

**Full Control Benefits**:
- Complete control over rendering pipeline
- Optimized specifically for use case requirements
- No third-party dependencies or licensing
- Minimal bundle size impact

**Development Requirements**:
- Implement viewport culling manually
- Build shape management system from scratch
- Handle hit testing and interaction events
- Create animation and easing systems

### When to Use This Approach

✅ **Ideal for**:
- Applications with specific performance requirements
- Teams with graphics programming experience  
- Projects requiring unique visual behaviors
- Long-term products needing full control

❌ **Avoid when**:
- Rapid prototyping is priority
- Team lacks Canvas2D experience
- Standard diagram features are sufficient
- Timeline constraints are tight

---

## Recommendation Summary

### For Rapid Development: **Konva.js**
- Mature API with extensive documentation
- Good balance of control and ease of use
- Strong community and examples
- TypeScript support included

### For Performance-Critical Applications: **PixiJS**  
- Handles large datasets (1000+ shapes) smoothly
- Future-proof with WebGL capabilities
- Advanced visual effects support
- Professional-grade rendering pipeline

### For Maximum Control: **Native Canvas2D**
- Complete customization freedom
- Optimized for specific requirements  
- No external dependencies
- Requires significant development investment

**Recommended Starting Point**: Begin with Konva.js for prototyping, then migrate to PixiJS or native implementation if performance requirements demand it.