import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Link as LinkIcon, Search, Loader2, Copy, Check, Key, Image as ImageIcon } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Social platform preview components
function FacebookPreview({ data }: { data: any }) {
  const og = data.openGraph
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-sm">
      <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
        {og.image ? (
          <img src={og.image} alt="" className="w-full h-full object-cover" onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.classList.remove('hidden')
          }} />
        ) : null}
        <div className={`flex flex-col items-center text-gray-400 ${og.image ? 'hidden' : ''}`}>
          <ImageIcon className="w-10 h-10 mb-2" />
          <span className="text-sm">IMAGE NOT FOUND</span>
          <span className="text-xs text-red-400">og:image missing</span>
        </div>
      </div>
      <div className="p-3 bg-gray-50">
        <div className="text-xs text-gray-500 uppercase">{data.url ? new URL(data.url).hostname : 'example.com'}</div>
        <div className="font-semibold text-gray-900 text-sm mt-1 line-clamp-1">{og.title || 'No title'}</div>
        <div className="text-gray-500 text-xs mt-1 line-clamp-2">{og.description || 'No description'}</div>
      </div>
      <div className="px-3 pb-3 bg-gray-50">
        <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded">Facebook</span>
      </div>
    </div>
  )
}

function WhatsAppPreview({ data }: { data: any }) {
  const og = data.openGraph
  return (
    <div className="bg-[#dcf8c6] rounded-lg overflow-hidden max-w-sm p-2">
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
          {og.image ? (
            <img src={og.image} alt="" className="w-full h-full object-cover" onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }} />
          ) : null}
          <div className={`flex flex-col items-center text-gray-400 ${og.image ? 'hidden' : ''}`}>
            <ImageIcon className="w-10 h-10 mb-2" />
            <span className="text-sm">IMAGE NOT FOUND</span>
            <span className="text-xs text-red-400">og:image missing</span>
          </div>
        </div>
        <div className="p-3">
          <div className="font-semibold text-gray-900 text-sm line-clamp-1">{og.title || 'No title'}</div>
          <div className="text-gray-500 text-xs mt-1 line-clamp-2">{og.description || 'No description'}</div>
          <div className="text-xs text-gray-400 mt-1">{data.url ? new URL(data.url).hostname : 'example.com'}</div>
        </div>
      </div>
      <div className="mt-2 flex justify-center">
        <span className="inline-block bg-[#25D366] text-white text-xs font-semibold px-3 py-1.5 rounded">WhatsApp</span>
      </div>
    </div>
  )
}

function TwitterPreview({ data }: { data: any }) {
  const tw = data.twitterCard
  const og = data.openGraph
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-sm">
      <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center">
        {(tw.image || og.image) ? (
          <img src={tw.image || og.image} alt="" className="w-full h-full object-cover" onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.classList.remove('hidden')
          }} />
        ) : null}
        <div className={`flex flex-col items-center text-gray-400 ${(tw.image || og.image) ? 'hidden' : ''}`}>
          <ImageIcon className="w-10 h-10 mb-2" />
          <span className="text-sm">IMAGE NOT FOUND</span>
          <span className="text-xs text-red-400">twitter:image missing</span>
        </div>
      </div>
      <div className="p-3">
        <div className="font-semibold text-gray-900 text-sm line-clamp-1">{tw.title || og.title || 'No title'}</div>
        <div className="text-gray-500 text-xs mt-1 line-clamp-2">{tw.description || og.description || 'No description'}</div>
        <div className="text-xs text-gray-400 mt-1">{data.url ? new URL(data.url).hostname : 'example.com'}</div>
      </div>
      <div className="px-3 pb-3">
        <span className="inline-block bg-black text-white text-xs font-semibold px-3 py-1.5 rounded">Twitter</span>
      </div>
    </div>
  )
}

function LinkedInPreview({ data }: { data: any }) {
  const og = data.openGraph
  return (
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden max-w-sm">
      <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
        {og.image ? (
          <img src={og.image} alt="" className="w-full h-full object-cover" onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.classList.remove('hidden')
          }} />
        ) : null}
        <div className={`flex flex-col items-center text-gray-400 ${og.image ? 'hidden' : ''}`}>
          <ImageIcon className="w-10 h-10 mb-2" />
          <span className="text-sm">IMAGE NOT FOUND</span>
          <span className="text-xs text-red-400">og:image missing</span>
        </div>
      </div>
      <div className="p-3 bg-gray-50">
        <div className="font-semibold text-gray-900 text-sm line-clamp-1">{og.title || 'No title'}</div>
        <div className="text-xs text-gray-400 uppercase mt-1">{data.url ? new URL(data.url).hostname : 'example.com'}</div>
      </div>
      <div className="px-3 pb-3 bg-gray-50">
        <span className="inline-block bg-[#0A66C2] text-white text-xs font-semibold px-3 py-1.5 rounded">LinkedIn</span>
      </div>
    </div>
  )
}

function DiscordPreview({ data }: { data: any }) {
  const og = data.openGraph
  return (
    <div className="bg-[#36393f] rounded-lg overflow-hidden max-w-sm">
      <div className="border-l-4 border-[#5865f2] bg-[#2f3136] m-2 rounded">
        <div className="p-3">
          <div className="text-xs text-gray-400">{data.url ? new URL(data.url).hostname : 'example.com'}</div>
          <div className="font-semibold text-[#00aff4] text-sm mt-1 line-clamp-1 hover:underline cursor-pointer">{og.title || 'No title'}</div>
          <div className="text-gray-300 text-xs mt-1 line-clamp-2">{og.description || 'No description'}</div>
          <div className="mt-3 aspect-video bg-[#202225] rounded flex items-center justify-center max-w-[200px]">
            {og.image ? (
              <img src={og.image} alt="" className="w-full h-full object-cover rounded" onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }} />
            ) : null}
            <div className={`flex flex-col items-center text-gray-500 ${og.image ? 'hidden' : ''}`}>
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs">IMAGE NOT FOUND</span>
              <span className="text-xs text-red-400">og:image missing</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-3 pb-3">
        <span className="inline-block bg-[#5865f2] text-white text-xs font-semibold px-3 py-1.5 rounded">Discord</span>
      </div>
    </div>
  )
}

function PinterestPreview({ data }: { data: any }) {
  const og = data.openGraph
  return (
    <div className="bg-white rounded-2xl overflow-hidden max-w-[240px] shadow-lg">
      <div className="aspect-[2/3] bg-gray-100 flex items-center justify-center">
        {og.image ? (
          <img src={og.image} alt="" className="w-full h-full object-cover" onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.classList.remove('hidden')
          }} />
        ) : null}
        <div className={`flex flex-col items-center text-gray-400 ${og.image ? 'hidden' : ''}`}>
          <ImageIcon className="w-10 h-10 mb-2" />
          <span className="text-sm">IMAGE NOT FOUND</span>
          <span className="text-xs text-red-400">og:image missing</span>
        </div>
      </div>
      <div className="p-3 text-center">
        <span className="inline-block bg-[#E60023] text-white text-xs font-semibold px-3 py-1.5 rounded-full">Pinterest</span>
      </div>
    </div>
  )
}

function SlackPreview({ data }: { data: any }) {
  const og = data.openGraph
  return (
    <div className="bg-white rounded-lg border-l-4 border-gray-400 shadow-sm max-w-sm">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-xs font-semibold text-gray-700">{og.siteName || (data.url ? new URL(data.url).hostname : 'example.com')}</span>
        </div>
        <div className="font-semibold text-[#1264a3] text-sm line-clamp-1 hover:underline cursor-pointer">{og.title || 'No title'}</div>
        <div className="text-gray-600 text-xs mt-1 line-clamp-2">{og.description || 'No description'}</div>
        {og.image && (
          <div className="mt-2 max-w-[200px]">
            <img src={og.image} alt="" className="rounded border" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
        )}
      </div>
      <div className="px-3 pb-3">
        <span className="inline-block bg-[#4A154B] text-white text-xs font-semibold px-3 py-1.5 rounded">Slack</span>
      </div>
    </div>
  )
}

export default function PlaygroundPage() {
  const [url, setUrl] = useState('https://github.com')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'previews' | 'json'>('previews')
  
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
    <div className="min-h-screen bg-gray-950">
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
            <Link to="/generator" className="text-gray-400 hover:text-white transition-colors">Generator</Link>
            <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Docs</Link>
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/signup" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Social Media Preview Debugger</h1>
            <p className="text-gray-400 text-lg">See how your URL appears across all major platforms</p>
          </div>
          
          {/* API Key Input */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="card p-6">
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
              </p>
            </div>
          </div>
          
          {/* URL Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="card p-6">
              <label className="block text-sm font-medium mb-2">Enter URL to analyze</label>
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
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>Analyze</>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl">
                {error}
              </div>
            </div>
          )}
          
          {/* Result */}
          {result && (
            <div className="space-y-8">
              {/* Stats Bar */}
              <div className="flex justify-center gap-4">
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
              
              {/* Tabs */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setActiveTab('previews')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'previews' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Social Previews
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'json' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Raw JSON
                </button>
              </div>
              
              {activeTab === 'previews' ? (
                /* Social Media Previews Grid */
                <div className="bg-gray-100 rounded-2xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center">
                      <FacebookPreview data={result.data} />
                    </div>
                    <div className="flex flex-col items-center">
                      <WhatsAppPreview data={result.data} />
                    </div>
                    <div className="flex flex-col items-center">
                      <TwitterPreview data={result.data} />
                    </div>
                    <div className="flex flex-col items-center">
                      <LinkedInPreview data={result.data} />
                    </div>
                    <div className="flex flex-col items-center">
                      <DiscordPreview data={result.data} />
                    </div>
                    <div className="flex flex-col items-center">
                      <SlackPreview data={result.data} />
                    </div>
                  </div>
                </div>
              ) : (
                /* Raw JSON */
                <div className="card p-6 max-w-4xl mx-auto">
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
                  <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm max-h-[500px] overflow-y-auto">
                    <code className="text-gray-300">
                      {JSON.stringify(result.data, null, 2)}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {/* Code Example */}
          <div className="max-w-2xl mx-auto mt-12">
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">API Example</h2>
              <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm">
                <code className="text-gray-300">{`curl "${API_URL}/extract?url=${encodeURIComponent(url)}" \\
  -H "X-API-Key: ${apiKey || 'your_api_key'}"`}</code>
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
