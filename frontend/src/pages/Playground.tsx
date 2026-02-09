import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Link as LinkIcon, Search, Loader2, ExternalLink, Copy, Check, Key } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export default function PlaygroundPage() {
  const [url, setUrl] = useState('https://github.com')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  
  const handleExtract = async () => {
    if (!apiKey.trim()) {
      setError('API key is required. Sign up to get one!')
      return
    }
    
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const res = await fetch(`${API_URL}/extract?url=${encodeURIComponent(url)}`, {
        headers: {
          'X-API-Key': apiKey.trim()
        }
      })
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to extract')
      }
      
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to extract metadata')
    } finally {
      setLoading(false)
    }
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            Ogify
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Docs</Link>
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/signup" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">API Playground</h1>
            <p className="text-gray-400 text-lg">Test the metadata extraction API live</p>
          </div>
          
          {/* API Key Input */}
          <div className="card p-6 mb-6">
            <label className="block text-sm font-medium mb-2">
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                API Key
              </span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="og_xxxxxxxxxxxxxxxxxxxxxxxx"
              className="input font-mono"
            />
            <p className="text-gray-500 text-sm mt-2">
              Don't have an API key?{' '}
              <Link to="/signup" className="text-purple-400 hover:underline">Sign up for free</Link>
              {' '}or{' '}
              <Link to="/dashboard" className="text-purple-400 hover:underline">get one from your dashboard</Link>.
            </p>
          </div>
          
          {/* URL Input */}
          <div className="card p-6 mb-8">
            <label className="block text-sm font-medium mb-2">Enter a URL to extract metadata</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="input pl-12"
                  onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                />
              </div>
              <button
                onClick={handleExtract}
                disabled={loading || !url}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>Extract</>
                )}
              </button>
            </div>
          </div>
          
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl mb-8">
              {error}
            </div>
          )}
          
          {/* Result */}
          {result && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="flex gap-4">
                <div className="card px-4 py-2 text-sm">
                  <span className="text-gray-400">Latency:</span>{' '}
                  <span className="font-medium">{result.latencyMs}ms</span>
                </div>
                <div className="card px-4 py-2 text-sm">
                  <span className="text-gray-400">Cached:</span>{' '}
                  <span className={`font-medium ${result.cached ? 'text-green-400' : 'text-gray-400'}`}>
                    {result.cached ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              {/* Preview Card */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Preview</h2>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex gap-4">
                    {result.data.openGraph.image && (
                      <img
                        src={result.data.openGraph.image}
                        alt=""
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {result.data.openGraph.title || 'No title'}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {result.data.openGraph.description || 'No description'}
                      </p>
                      <a
                        href={result.data.url}
                        target="_blank"
                        rel="noopener"
                        className="text-primary-400 text-sm flex items-center gap-1 hover:underline"
                      >
                        {result.data.openGraph.siteName || new URL(result.data.url).hostname}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Raw JSON */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Raw Response</h2>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm">
                  <code className="text-gray-300">
                    {JSON.stringify(result.data, null, 2)}
                  </code>
                </pre>
              </div>
            </div>
          )}
          
          {/* Code Example */}
          <div className="card p-6 mt-12">
            <h2 className="text-lg font-semibold mb-4">Code Example</h2>
            <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-gray-300">{`// Node.js / JavaScript
const response = await fetch(
  '${API_URL}/extract?url=${encodeURIComponent(url)}',
  {
    headers: { 'X-API-Key': '${apiKey || 'your_api_key'}' }
  }
);

const data = await response.json();
console.log(data.data.openGraph);`}</code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}
