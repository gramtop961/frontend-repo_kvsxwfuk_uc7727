import { useState, useRef } from 'react'
import Spline from '@splinetool/react-spline'

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setError('')
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const onDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setError('')
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const detect = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const form = new FormData()
      form.append('image', file)
      const res = await fetch(`${baseUrl}/api/detect`, { method: 'POST', body: form })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `Request failed: ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white text-gray-800">
      {/* Hero with Spline */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/Tu-wEVxfDuICpwJI/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Soft gradient overlay to improve text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-white/80 pointer-events-none" />
        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100/70 text-rose-700 px-4 py-1 text-sm font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Floture Detector
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-rose-800">
            Detect the red “floture” flower
          </h1>
          <p className="max-w-2xl text-base sm:text-lg text-rose-900/70">
            Upload an image and our vision model will estimate whether a floture is present, with a confidence score.
          </p>
          <div className="pt-2">
            <button onClick={() => inputRef.current?.click()} className="rounded-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-semibold shadow-lg transition">
              Upload an image
            </button>
          </div>
        </div>
      </section>

      {/* Detector Panel */}
      <section className="max-w-6xl mx-auto px-6 -mt-16 sm:-mt-20 relative z-20">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-2xl bg-white/80 backdrop-blur shadow-xl border border-rose-100 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">Upload</h2>
            <p className="text-sm text-rose-900/70">Drag and drop an image here, or click to choose a file.</p>
            <div
              className="group relative rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-400 transition p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-rose-50/30"
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 grid place-items-center text-xl font-bold">⟡</div>
              <div className="text-center">
                <p className="font-medium">Choose an image</p>
                <p className="text-xs text-rose-900/60">PNG, JPG up to ~10MB</p>
              </div>
            </div>
            {preview && (
              <div className="rounded-xl overflow-hidden border border-rose-100 bg-white">
                <img src={preview} alt="preview" className="w-full h-64 object-cover" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={detect}
                disabled={!file || loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 disabled:bg-rose-300 text-white px-5 py-2.5 font-semibold shadow hover:bg-rose-700 transition"
              >
                {loading ? 'Analyzing…' : 'Detect floture'}
              </button>
              {file && !loading && (
                <button onClick={() => { setFile(null); setPreview(null); setResult(null); setError('') }} className="text-rose-700 hover:text-rose-900 text-sm">
                  Clear
                </button>
              )}
            </div>
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">Result</h2>
            {!result && (
              <div className="h-full min-h-[260px] rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white grid place-items-center text-rose-900/60">
                {loading ? 'Processing image…' : 'No result yet'}
              </div>
            )}
            {result && (
              <div className={`rounded-2xl border p-6 shadow-sm ${result.detected ? 'border-green-200 bg-green-50' : 'border-rose-200 bg-rose-50'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">
                    {result.detected ? 'Floture detected' : 'Floture not detected'}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${result.detected ? 'bg-green-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {Math.round((result.confidence ?? 0) * 100)}%
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-white/70 border border-white p-3">
                    <p className="text-rose-900/60">Red ratio</p>
                    <p className="font-mono">{result?.metrics?.red_ratio}</p>
                  </div>
                  <div className="rounded-lg bg-white/70 border border-white p-3">
                    <p className="text-rose-900/60">Saturation</p>
                    <p className="font-mono">{result?.metrics?.saturation}</p>
                  </div>
                  <div className="rounded-lg bg-white/70 border border-white p-3">
                    <p className="text-rose-900/60">Image size</p>
                    <p className="font-mono">{result?.metrics?.width}×{result?.metrics?.height}</p>
                  </div>
                  <div className="rounded-lg bg-white/70 border border-white p-3">
                    <p className="text-rose-900/60">Label</p>
                    <p className="font-mono">{result.label}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-xs text-rose-900/50 py-8">
          This demo uses a color-based heuristic inspired by red spider lily imagery.
        </div>
      </section>
    </div>
  )
}

export default App
