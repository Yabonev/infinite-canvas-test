# Deep Dive: Diagram Libraries for Keyboard-Driven Infinite Canvas

**Last updated:** 2025-09-25

## Problem Fit and Decision Criteria

For keyboard-only diagram creation with auto camera control, existing diagram libraries provide:

- **Pre-built node/edge systems** for rapid development
- **Layout algorithms** for automatic positioning
- **Existing keyboard shortcuts** that may need extension
- **Infinite canvas implementations** with varying capabilities
- **Shape connection systems** with arrow rendering

## Approach 1: React Flow + Custom Keyboard Layer

### Problem Fit
React Flow excels at node-based diagrams but is primarily designed for mouse/touch interactions. The keyboard navigation requires significant custom implementation.

### Minimal Working Example

```typescript
import ReactFlow, { 
  Node, 
  Edge, 
  useNodesState, 
  useEdgesState,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

interface KeyboardFlowProps {}

const KeyboardFlow: React.FC<KeyboardFlowProps> = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Class A' } },
    { id: '2', position: { x: 300, y: 200 }, data: { label: 'Class B' } }
  ]);
  
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: '1', target: '2' }
  ]);
  
  const [selectedNode, setSelectedNode] = React.useState<string | null>('1');
  const { fitView, getNodes, setCenter } = useReactFlow();
  
  React.useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (!selectedNode) return;
      
      const currentNode = nodes.find(n => n.id === selectedNode);
      if (!currentNode) return;
      
      const moveSpeed = event.shiftKey ? 50 : 10;
      
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyH': // Vim-style
          updateNodePosition(selectedNode, { x: -moveSpeed, y: 0 });
          break;
        case 'ArrowRight':
        case 'KeyL':
          updateNodePosition(selectedNode, { x: moveSpeed, y: 0 });
          break;
        case 'ArrowUp':
        case 'KeyK':
          updateNodePosition(selectedNode, { x: 0, y: -moveSpeed });
          break;
        case 'ArrowDown':
        case 'KeyJ':
          updateNodePosition(selectedNode, { x: 0, y: moveSpeed });
          break;
        case 'Tab':
          event.preventDefault();
          navigateToNextNode(event.shiftKey ? -1 : 1);
          break;
        case 'Enter':
          createConnectedNode();
          break;
        case 'KeyC':
          if (event.ctrlKey) createConnection();
          break;
        case 'Delete':
        case 'Backspace':
          deleteSelectedNode();
          break;
        case 'KeyF':
          focusOnSelectedNode();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [selectedNode, nodes]);
  
  const updateNodePosition = (nodeId: string, delta: { x: number; y: number }) => {
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId 
        ? { ...node, position: { 
            x: node.position.x + delta.x, 
            y: node.position.y + delta.y 
          }}
        : node
    ));
  };
  
  const navigateToNextNode = (direction: 1 | -1) => {
    const nodeIds = nodes.map(n => n.id);
    const currentIndex = nodeIds.indexOf(selectedNode!);
    const nextIndex = (currentIndex + direction + nodeIds.length) % nodeIds.length;
    setSelectedNode(nodeIds[nextIndex]);
  };
  
  const createConnectedNode = () => {
    const currentNode = nodes.find(n => n.id === selectedNode);
    if (!currentNode) return;
    
    const newId = `node-${Date.now()}`;
    const newNode = {
      id: newId,
      position: { 
        x: currentNode.position.x + 200, 
        y: currentNode.position.y 
      },
      data: { label: `Node ${newId}` }
    };
    
    const newEdge = {
      id: `${selectedNode}-${newId}`,
      source: selectedNode!,
      target: newId
    };
    
    setNodes(nodes => [...nodes, newNode]);
    setEdges(edges => [...edges, newEdge]);
    setSelectedNode(newId);
  };
  
  const createConnection = () => {
    // Implementation for connecting current node to another selected node
    console.log('Create connection mode - select target node');
  };
  
  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    
    setNodes(nodes => nodes.filter(n => n.id !== selectedNode));
    setEdges(edges => edges.filter(e => 
      e.source !== selectedNode && e.target !== selectedNode
    ));
    
    const remainingNodes = nodes.filter(n => n.id !== selectedNode);
    setSelectedNode(remainingNodes.length > 0 ? remainingNodes[0].id : null);
  };
  
  const focusOnSelectedNode = () => {
    const currentNode = nodes.find(n => n.id === selectedNode);
    if (!currentNode) return;
    
    setCenter(currentNode.position.x, currentNode.position.y, { zoom: 1.2, duration: 800 });
  };
  
  // Custom node component with selection highlighting
  const CustomNode = ({ data, selected }: any) => (
    <div style={{
      padding: '10px',
      border: `2px solid ${selected ? '#007bff' : '#ddd'}`,
      borderRadius: '5px',
      background: selected ? '#e3f2fd' : 'white',
      minWidth: '100px',
      textAlign: 'center'
    }}>
      {data.label}
    </div>
  );
  
  const nodeTypes = {
    default: CustomNode
  };
  
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes.map(node => ({ 
          ...node, 
          selected: node.id === selectedNode 
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      
      {/* Keyboard shortcuts help */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div><strong>Keyboard Shortcuts:</strong></div>
        <div>Arrow keys / HJKL: Move node</div>
        <div>Tab / Shift+Tab: Navigate nodes</div>
        <div>Enter: Create connected node</div>
        <div>Delete: Remove node</div>
        <div>F: Focus on node</div>
        <div>Ctrl+C: Create connection</div>
      </div>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const KeyboardDiagramApp = () => (
  <ReactFlowProvider>
    <KeyboardFlow />
  </ReactFlowProvider>
);

export default KeyboardDiagramApp;
```

### Architecture Notes

**Infinite Canvas System**: React Flow provides built-in infinite canvas through:
- Viewport transformation with pan/zoom controls
- Automatic canvas resizing and boundary management
- Built-in minimap for navigation overview
- Smooth animations for focus transitions

**Integration with Existing Features**:
- Leverages React Flow's layout algorithms (dagre, elkjs)
- Uses built-in edge routing and connection validation
- Integrates with selection system and event handling
- Compatible with React Flow's plugin ecosystem

### Integration Steps

1. **Install Dependencies**
```bash
npm install reactflow
npm install dagre @types/dagre  # for auto-layout
```

2. **Extend Node Types**
```typescript
const customNodeTypes = {
  class: ClassNode,
  method: MethodNode,
  dependency: DependencyNode
};

interface ClassNodeData {
  className: string;
  methods: string[];
  dependencies: string[];
}
```

3. **Implement Auto-Layout**
```typescript
import dagre from 'dagre';

const useAutoLayout = (nodes: Node[], edges: Edge[]) => {
  return React.useMemo(() => {
    const graph = new dagre.graphlib.Graph();
    graph.setDefaultEdgeLabel(() => ({}));
    graph.setGraph({ rankdir: 'TB', ranksep: 50, nodesep: 50 });
    
    nodes.forEach(node => graph.setNode(node.id, { width: 100, height: 60 }));
    edges.forEach(edge => graph.setEdge(edge.source, edge.target));
    
    dagre.layout(graph);
    
    return nodes.map(node => ({
      ...node,
      position: graph.node(node.id)
    }));
  }, [nodes, edges]);
};
```

### Performance Considerations

**Strengths**:
- Mature infinite canvas implementation
- Built-in performance optimizations (viewport culling)
- Strong React integration with hooks and context
- Extensive plugin ecosystem

**Limitations**:
- DOM-based rendering limits scalability (~500 nodes)
- Keyboard navigation requires custom implementation
- Mouse-centric design philosophy
- Bundle size includes features not needed for keyboard-only use

### When NOT to Use This

- Applications requiring >500 simultaneous nodes
- Pure keyboard-only interfaces (mouse features create confusion)
- Non-React applications
- Applications needing custom visual effects or animations

---

## Approach 2: tldraw SDK + Keyboard Extensions

### Problem Fit
tldraw provides a complete infinite canvas solution but requires extending the built-in keyboard shortcuts and tool system for diagram-specific workflows.

### Minimal Working Example

```typescript
import { Tldraw, TldrawEditorProps, useEditor, TLShape, createShapeId } from 'tldraw';
import 'tldraw/tldraw.css';

interface DiagramShape extends TLShape {
  type: 'diagram-class' | 'diagram-method';
  props: {
    text: string;
    connections: string[];
  };
}

const KeyboardDiagramTldraw = () => {
  const [selectedShapeId, setSelectedShapeId] = React.useState<string | null>(null);
  
  const handleMount = (editor: any) => {
    // Add custom keyboard shortcuts
    editor.addKeyboardShortcut('ctrl+shift+c', () => {
      createClassShape(editor);
    });
    
    editor.addKeyboardShortcut('ctrl+shift+m', () => {
      createMethodShape(editor);
    });
    
    editor.addKeyboardShortcut('ctrl+enter', () => {
      if (selectedShapeId) {
        createConnectedShape(editor, selectedShapeId);
      }
    });
    
    editor.addKeyboardShortcut('f', () => {
      if (selectedShapeId) {
        focusOnShape(editor, selectedShapeId);
      }
    });
    
    // Override arrow key behavior for precise movement
    const originalKeyHandler = editor.onKeyDown;
    editor.onKeyDown = (e: KeyboardEvent) => {
      if (handleDiagramKeys(e, editor)) {
        e.preventDefault();
        return;
      }
      originalKeyHandler?.(e);
    };
  };
  
  const handleDiagramKeys = (e: KeyboardEvent, editor: any): boolean => {
    const selected = editor.getSelectedShapes();
    if (selected.length !== 1) return false;
    
    const shape = selected[0];
    const moveDistance = e.shiftKey ? 20 : 5;
    
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyH':
        moveShape(editor, shape.id, { x: -moveDistance, y: 0 });
        return true;
      case 'ArrowRight':
      case 'KeyL':
        moveShape(editor, shape.id, { x: moveDistance, y: 0 });
        return true;
      case 'ArrowUp':
      case 'KeyK':
        moveShape(editor, shape.id, { x: 0, y: -moveDistance });
        return true;
      case 'ArrowDown':
      case 'KeyJ':
        moveShape(editor, shape.id, { x: 0, y: moveDistance });
        return true;
      case 'Tab':
        navigateShapes(editor, e.shiftKey ? -1 : 1);
        return true;
    }
    return false;
  };
  
  const createClassShape = (editor: any) => {
    const shapeId = createShapeId();
    const center = editor.getViewportPageCenter();
    
    editor.createShape({
      id: shapeId,
      type: 'geo',
      x: center.x - 50,
      y: center.y - 30,
      props: {
        geo: 'rectangle',
        w: 100,
        h: 60,
        fill: 'solid',
        color: 'blue',
        text: 'Class'
      }
    });
    
    editor.select(shapeId);
    setSelectedShapeId(shapeId);
  };
  
  const createMethodShape = (editor: any) => {
    const shapeId = createShapeId();
    const center = editor.getViewportPageCenter();
    
    editor.createShape({
      id: shapeId,
      type: 'geo',
      x: center.x - 40,
      y: center.y - 20,
      props: {
        geo: 'ellipse',
        w: 80,
        h: 40,
        fill: 'solid',
        color: 'green',
        text: 'Method'
      }
    });
    
    editor.select(shapeId);
    setSelectedShapeId(shapeId);
  };
  
  const createConnectedShape = (editor: any, sourceId: string) => {
    const sourceShape = editor.getShape(sourceId);
    if (!sourceShape) return;
    
    const targetId = createShapeId();
    const arrowId = createShapeId();
    
    // Create target shape
    editor.createShape({
      id: targetId,
      type: 'geo',
      x: sourceShape.x + 150,
      y: sourceShape.y,
      props: {
        geo: 'rectangle',
        w: 100,
        h: 60,
        fill: 'solid',
        color: 'red',
        text: 'Connected'
      }
    });
    
    // Create arrow connection
    editor.createShape({
      id: arrowId,
      type: 'arrow',
      x: 0,
      y: 0,
      props: {
        start: {
          type: 'binding',
          boundShapeId: sourceId,
          normalizedAnchor: { x: 1, y: 0.5 }
        },
        end: {
          type: 'binding',
          boundShapeId: targetId,
          normalizedAnchor: { x: 0, y: 0.5 }
        }
      }
    });
    
    editor.select(targetId);
    setSelectedShapeId(targetId);
  };
  
  const moveShape = (editor: any, shapeId: string, delta: { x: number; y: number }) => {
    const shape = editor.getShape(shapeId);
    if (!shape) return;
    
    editor.updateShape({
      id: shapeId,
      type: shape.type,
      x: shape.x + delta.x,
      y: shape.y + delta.y
    });
  };
  
  const navigateShapes = (editor: any, direction: 1 | -1) => {
    const shapes = editor.getCurrentPageShapes();
    if (shapes.length === 0) return;
    
    const currentIndex = selectedShapeId 
      ? shapes.findIndex(s => s.id === selectedShapeId)
      : -1;
    
    const nextIndex = currentIndex === -1 
      ? 0 
      : (currentIndex + direction + shapes.length) % shapes.length;
    
    const nextShape = shapes[nextIndex];
    editor.select(nextShape.id);
    setSelectedShapeId(nextShape.id);
    
    // Auto-focus on selected shape
    focusOnShape(editor, nextShape.id);
  };
  
  const focusOnShape = (editor: any, shapeId: string) => {
    const shape = editor.getShape(shapeId);
    if (!shape) return;
    
    editor.zoomToBounds({
      x: shape.x - 100,
      y: shape.y - 100,
      w: shape.props.w + 200,
      h: shape.props.h + 200
    }, { duration: 600 });
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw onMount={handleMount} />
      
      {/* Custom keyboard shortcuts overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div><strong>Diagram Shortcuts:</strong></div>
        <div>Ctrl+Shift+C: Create Class</div>
        <div>Ctrl+Shift+M: Create Method</div>
        <div>Ctrl+Enter: Create Connected Shape</div>
        <div>Arrow Keys/HJKL: Move Shape</div>
        <div>Tab/Shift+Tab: Navigate Shapes</div>
        <div>F: Focus on Shape</div>
      </div>
    </div>
  );
};

export default KeyboardDiagramTldraw;
```

### Architecture Notes

**Built-in Infinite Canvas**: tldraw provides professional-grade infinite canvas with:
- Smooth zoom/pan with momentum
- Viewport-based rendering optimization
- Multi-touch gesture support
- Undo/redo system integrated with all operations

**Extension Points**:
- Custom tool creation for diagram-specific interactions
- Shape type extensions for specialized nodes
- Keyboard shortcut system for custom commands
- Event system for auto-layout and camera control

### Performance Considerations

**Strengths**:
- Professional-grade infinite canvas implementation
- Optimized rendering with viewport culling
- Built-in collaboration features
- Mature undo/redo and persistence systems

**Limitations**:
- Large bundle size (full whiteboard application)
- Commercial license required for production (watermark removal)
- Opinionated UI/UX that may conflict with keyboard-first design
- Learning curve for customization APIs

### When to Use This Approach

✅ **Ideal for**:
- Applications that can benefit from full whiteboard features
- Teams comfortable with commercial licensing
- Projects needing collaboration features
- Applications requiring professional polish

❌ **Avoid when**:
- Bundle size is critical concern
- Pure keyboard-only interface required
- Highly customized visual design needed
- Budget constraints prevent commercial licensing

---

## Approach 3: GoJS with Enhanced Keyboard Navigation

### Problem Fit
GoJS provides enterprise-grade diagramming with built-in keyboard navigation, but requires commercial licensing and has a complex API.

### Minimal Working Example

```typescript
import * as go from 'gojs';

class GoJSKeyboardDiagram {
  private diagram: go.Diagram;
  
  constructor(divId: string) {
    this.diagram = go.GraphObject.make(go.Diagram, divId, {
      'undoManager.isEnabled': true,
      'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
      'clickCreatingTool.isDoubleClick': false,
      allowDrop: true,
      allowClipboard: true,
      'toolManager.hoverDelay': 100,
      'toolManager.toolTipDuration': 10000,
      initialAutoScale: go.Diagram.Uniform,
      'commandHandler.deletesTree': true
    });
    
    this.setupNodeTemplate();
    this.setupLinkTemplate();
    this.setupKeyboardCommands();
    this.loadSampleData();
  }
  
  private setupNodeTemplate() {
    this.diagram.nodeTemplate = 
      go.GraphObject.make(go.Node, 'Auto',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        
        // Shape
        go.GraphObject.make(go.Shape, 'RoundedRectangle',
          { strokeWidth: 2, fill: 'white' },
          new go.Binding('fill', 'color')),
        
        // Text
        go.GraphObject.make(go.TextBlock,
          { margin: 8, font: '14px sans-serif', editable: true },
          new go.Binding('text').makeTwoWay())
      );
  }
  
  private setupLinkTemplate() {
    this.diagram.linkTemplate = 
      go.GraphObject.make(go.Link,
        { routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver, corner: 5, toShortLength: 4 },
        
        // Arrow shape
        go.GraphObject.make(go.Shape, { strokeWidth: 2 }),
        go.GraphObject.make(go.Shape, { toArrow: 'Standard', strokeWidth: 0 })
      );
  }
  
  private setupKeyboardCommands() {
    const cmd = this.diagram.commandHandler;
    
    // Override default keyboard shortcuts
    this.diagram.toolManager.keyDownEventHandler = (e: go.InputEvent) => {
      const diagram = e.diagram;
      const cmd = diagram.commandHandler;
      
      if (e.key === 'Enter' && e.control) {
        this.createConnectedNode();
        return;
      }
      
      if (e.key === 'F') {
        this.focusOnSelection();
        return;
      }
      
      if (e.key === 'G') {
        this.groupSelection();
        return;
      }
      
      if (e.key === 'C' && e.shift) {
        this.createClassNode();
        return;
      }
      
      if (e.key === 'M' && e.shift) {
        this.createMethodNode();
        return;
      }
      
      // Enhanced arrow key movement
      if (e.key === 'ArrowLeft' || e.key === 'h') {
        this.moveSelection(-10, 0);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'l') {
        this.moveSelection(10, 0);
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        this.moveSelection(0, -10);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        this.moveSelection(0, 10);
        return;
      }
      
      // Default GoJS keyboard handling
      diagram.doKeyDown();
    };
  }
  
  private createConnectedNode() {
    const selection = this.diagram.selection.first();
    if (!selection) return;
    
    this.diagram.startTransaction('create connected node');
    
    const nodeData = {
      key: this.generateKey(),
      text: 'New Connected Node',
      color: 'lightgreen',
      loc: `${selection.location.x + 150} ${selection.location.y}`
    };
    
    const linkData = {
      from: selection.data.key,
      to: nodeData.key
    };
    
    this.diagram.model.addNodeData(nodeData);
    this.diagram.model.addLinkData(linkData);
    this.diagram.commitTransaction('create connected node');
    
    // Select the new node
    const newNode = this.diagram.findNodeForData(nodeData);
    if (newNode) {
      this.diagram.select(newNode);
      this.focusOnSelection();
    }
  }
  
  private createClassNode() {
    const center = this.diagram.viewportBounds.center;
    
    this.diagram.startTransaction('create class node');
    const nodeData = {
      key: this.generateKey(),
      text: 'Class',
      color: 'lightblue',
      loc: `${center.x} ${center.y}`
    };
    
    this.diagram.model.addNodeData(nodeData);
    this.diagram.commitTransaction('create class node');
    
    const newNode = this.diagram.findNodeForData(nodeData);
    if (newNode) {
      this.diagram.select(newNode);
    }
  }
  
  private createMethodNode() {
    const center = this.diagram.viewportBounds.center;
    
    this.diagram.startTransaction('create method node');
    const nodeData = {
      key: this.generateKey(),
      text: 'Method',
      color: 'lightyellow',
      loc: `${center.x} ${center.y}`
    };
    
    this.diagram.model.addNodeData(nodeData);
    this.diagram.commitTransaction('create method node');
    
    const newNode = this.diagram.findNodeForData(nodeData);
    if (newNode) {
      this.diagram.select(newNode);
    }
  }
  
  private moveSelection(deltaX: number, deltaY: number) {
    const selection = this.diagram.selection;
    if (selection.count === 0) return;
    
    this.diagram.startTransaction('move selection');
    selection.each(node => {
      if (node instanceof go.Node) {
        node.location = new go.Point(
          node.location.x + deltaX,
          node.location.y + deltaY
        );
      }
    });
    this.diagram.commitTransaction('move selection');
  }
  
  private focusOnSelection() {
    const selection = this.diagram.selection;
    if (selection.count === 0) return;
    
    const bounds = this.diagram.computePartsBounds(selection);
    this.diagram.animatingTool.animateViewToRect(bounds.inflate(50, 50), 500);
  }
  
  private groupSelection() {
    if (this.diagram.selection.count < 2) return;
    this.diagram.commandHandler.groupSelection();
  }
  
  private generateKey(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private loadSampleData() {
    this.diagram.model = new go.GraphLinksModel([
      { key: 'Alpha', text: 'Alpha', color: 'lightblue', loc: '0 0' },
      { key: 'Beta', text: 'Beta', color: 'orange', loc: '150 0' },
      { key: 'Gamma', text: 'Gamma', color: 'lightgreen', loc: '0 150' },
      { key: 'Delta', text: 'Delta', color: 'pink', loc: '150 150' }
    ], [
      { from: 'Alpha', to: 'Beta' },
      { from: 'Alpha', to: 'Gamma' },
      { from: 'Gamma', to: 'Delta' }
    ]);
  }
}

// Usage
const keyboardDiagram = new GoJSKeyboardDiagram('gojs-div');
```

### Architecture Notes

**Enterprise Features**: GoJS provides comprehensive diagramming capabilities:
- Built-in layout algorithms (layered, circular, force-directed, tree)
- Advanced data binding and templating system
- Professional keyboard navigation and shortcuts
- Undo/redo system with transaction management
- Export capabilities (SVG, PNG, PDF)

**Keyboard Navigation**: GoJS includes sophisticated keyboard support:
- Tab-based navigation between diagram elements
- Arrow key movement with customizable increments
- Standard editing shortcuts (copy, paste, delete)
- Extensible command system for custom shortcuts

### Performance Considerations

**Strengths**:
- Handles thousands of nodes efficiently
- Optimized rendering with viewport culling
- Built-in virtualization for large datasets
- Professional-grade performance optimizations

**Limitations**:
- Commercial licensing required ($2,490+ per developer)
- Large API surface area creates learning curve
- Heavy bundle size for simple use cases
- Proprietary technology (not open source)

### When to Use This Approach

✅ **Ideal for**:
- Enterprise applications with budget for licensing
- Teams needing comprehensive diagramming features
- Applications requiring professional support
- Projects with complex layout requirements

❌ **Avoid when**:
- Budget constraints prevent commercial licensing
- Simple diagram requirements don't justify complexity
- Open source requirements
- Small team or startup environment

---

## Recommendation Summary

### For React Applications: **React Flow + Keyboard Layer**
- Excellent React integration with hooks and context
- MIT licensed with active community
- Good balance of features and customizability
- Requires custom keyboard navigation implementation

### For Maximum Features: **tldraw SDK**
- Professional infinite canvas implementation
- Built-in collaboration and persistence
- Requires commercial license for production use
- Best-in-class user experience

### For Enterprise Requirements: **GoJS**
- Most comprehensive diagramming features
- Professional keyboard navigation built-in
- Enterprise-grade support and documentation
- Commercial licensing required

**Recommended Starting Point**: React Flow with custom keyboard layer provides the best balance of functionality, cost, and development speed for most applications.