import { useEffect, useRef, useState } from 'react'
import { ViewportManager } from './core/viewport/ViewportManager'
import { KeyboardNavigationManager } from './core/navigation/KeyboardNavigationManager'
import { DiagramElement } from './types/diagram'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewportRef = useRef<ViewportManager | null>(null)
  const navManagerRef = useRef<KeyboardNavigationManager | null>(null)
  const [elements, setElements] = useState<DiagramElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<'select' | 'create' | 'connect'>('select')

  useEffect(() => {
    if (canvasRef.current && !viewportRef.current) {
      const canvas = canvasRef.current
      canvas.width = 800
      canvas.height = 600

      const viewport = new ViewportManager(canvas)
      viewportRef.current = viewport

      const navManager = new KeyboardNavigationManager(viewport)
      navManagerRef.current = navManager

      // Set up event handlers
      navManager.onElementCreate = (element) => {
        setElements(prev => [...prev, element])
      }

      navManager.onElementMove = (id, element) => {
        setElements(prev => prev.map(el => el.id === id ? element : el))
      }

      navManager.onElementDelete = (id) => {
        setElements(prev => prev.filter(el => el.id !== id))
      }

      navManager.onSelectionChange = (id) => {
        setSelectedId(id)
        renderCanvas()
      }

      navManager.onModeChange = (newMode) => {
        setMode(newMode)
      }

      // Initial render
      renderCanvas()
    }
  }, [])

  const renderCanvas = () => {
    if (!canvasRef.current || !viewportRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const viewport = viewportRef.current

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply viewport transform
    viewport.applyTransform()

    // Draw grid
    ctx.strokeStyle = '#f3f4f6'
    ctx.lineWidth = 1 / viewport.getViewport().zoom

    const bounds = viewport.getViewportBounds()
    const gridSize = 50

    const startX = Math.floor(bounds.x / gridSize) * gridSize
    const endX = Math.ceil((bounds.x + bounds.width) / gridSize) * gridSize
    const startY = Math.floor(bounds.y / gridSize) * gridSize
    const endY = Math.ceil((bounds.y + bounds.height) / gridSize) * gridSize

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, bounds.y)
      ctx.lineTo(x, bounds.y + bounds.height)
      ctx.stroke()
    }

    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(bounds.x, y)
      ctx.lineTo(bounds.x + bounds.width, y)
      ctx.stroke()
    }

    // Draw elements
    elements.forEach(element => {
      const isSelected = element.id === selectedId

      // Element background
      ctx.fillStyle = isSelected ? '#dbeafe' : '#f9fafb'
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#d1d5db'
      ctx.lineWidth = 2 / viewport.getViewport().zoom

      ctx.fillRect(element.x, element.y, element.width, element.height)
      ctx.strokeRect(element.x, element.y, element.width, element.height)

      // Element title
      ctx.fillStyle = '#111827'
      ctx.font = `${14 / viewport.getViewport().zoom}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText(
        element.type.charAt(0).toUpperCase() + element.type.slice(1),
        element.x + element.width / 2,
        element.y + 25 / viewport.getViewport().zoom
      )
    })

    // Draw connections
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 2 / viewport.getViewport().zoom

    elements.forEach(element => {
      element.connections.forEach(connId => {
        const connected = elements.find(el => el.id === connId)
        if (connected) {
          ctx.beginPath()
          ctx.moveTo(
            element.x + element.width / 2,
            element.y + element.height / 2
          )
          ctx.lineTo(
            connected.x + connected.width / 2,
            connected.y + connected.height / 2
          )
          ctx.stroke()

          // Arrow head
          const angle = Math.atan2(
            connected.y + connected.height / 2 - (element.y + element.height / 2),
            connected.x + connected.width / 2 - (element.x + element.width / 2)
          )

          const arrowLength = 10 / viewport.getViewport().zoom
          ctx.beginPath()
          ctx.moveTo(
            connected.x + connected.width / 2,
            connected.y + connected.height / 2
          )
          ctx.lineTo(
            connected.x + connected.width / 2 - arrowLength * Math.cos(angle - Math.PI / 6),
            connected.y + connected.height / 2 - arrowLength * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(
            connected.x + connected.width / 2,
            connected.y + connected.height / 2
          )
          ctx.lineTo(
            connected.x + connected.width / 2 - arrowLength * Math.cos(angle + Math.PI / 6),
            connected.y + connected.height / 2 - arrowLength * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        }
      })
    })

    viewport.restoreTransform()
  }

  useEffect(() => {
    renderCanvas()
  }, [elements, selectedId])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-2xl font-bold text-gray-900">Infinite Canvas Diagram</h1>
        <div className="text-sm text-gray-600 mt-1">
          Selected: {selectedId || 'None'} | Elements: {elements.length} | Mode: {mode}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Press 'c' to create class, 'm' for method, arrows to navigate, 'f' to focus
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">
          <canvas
            ref={canvasRef}
            className="block"
            style={{ width: '800px', height: '600px' }}
          />
        </div>
      </div>
    </div>
  )
}

export default App