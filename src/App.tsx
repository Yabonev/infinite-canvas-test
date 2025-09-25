import { useEffect, useRef } from 'react'
import { ViewportManager } from './core/viewport/ViewportManager'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewportRef = useRef<ViewportManager | null>(null)

  useEffect(() => {
    if (canvasRef.current && !viewportRef.current) {
      const canvas = canvasRef.current
      canvas.width = 800
      canvas.height = 600

      viewportRef.current = new ViewportManager(canvas)

      // Basic rendering
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw a simple grid
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1

      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw origin
      ctx.fillStyle = 'red'
      ctx.beginPath()
      ctx.arc(0, 0, 5, 0, 2 * Math.PI)
      ctx.fill()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Infinite Canvas Diagram</h1>
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ width: '800px', height: '600px' }}
        />
      </div>
      <p className="text-gray-600 mt-4 text-center">
        ViewportManager integrated. Next: add pan and zoom controls.
      </p>
    </div>
  )
}

export default App