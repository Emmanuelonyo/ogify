import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Link as LinkIcon, Copy, Check, Image as ImageIcon, Type, FileText, Globe, Upload } from 'lucide-react'

export default function GeneratorPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [siteName, setSiteName] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [copied, setCopied] = useState(false)

  const titleLength = title.length
  const descLength = description.length
  const titleMax = 60
  const descMax = 160

  const generateCode = () => {
    let domain = 'example.com'
    try {
      if (url) domain = new URL(url).hostname
    } catch {
      // Invalid URL, use default
    }
    
    return `<!-- HTML Meta Tags -->
<title>${title || 'Your Title'}</title>
<meta name="description" content="${description || 'Your description here'}">

<!-- Open Graph Meta Tags -->
<meta property="og:url" content="${url || 'https://example.com'}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title || 'Your Title'}">
<meta property="og:description" content="${description || 'Your description here'}">
<meta property="og:image" content="${imageUrl || ''}">
${siteName ? `<meta property="og:site_name" content="${siteName}">` : ''}

<!-- Twitter Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:domain" content="${domain}">
<meta property="twitter:url" content="${url || 'https://example.com'}">
<meta name="twitter:title" content="${title || 'Your Title'}">
<meta name="twitter:description" content="${description || 'Your description here'}">
<meta name="twitter:image" content="${imageUrl || ''}">
${twitterHandle ? `<meta name="twitter:site" content="@${twitterHandle.replace('@', '')}">` : ''}

<!-- Meta Tags Generated via Ogify -->`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCode())
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
            <Link to="/playground" className="text-gray-400 hover:text-white transition-colors">Debugger</Link>
            <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Docs</Link>
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/signup" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Meta Tag Generator</h1>
            <p className="text-gray-400 text-lg">Generate Open Graph and Twitter Card meta tags for your website</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Type className="w-5 h-5 text-purple-400" />
                  Basic Information
                </h2>

                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Your page title"
                    className="input"
                    maxLength={100}
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-500">Recommended length: 60 characters</span>
                    <span className={`font-medium ${titleLength > titleMax ? 'text-red-400' : 'text-gray-400'}`}>
                      {titleLength} / {titleMax}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of your page content"
                    className="input min-h-[100px] resize-y"
                    maxLength={300}
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-500">Recommended length: 150 - 160 characters</span>
                    <span className={`font-medium ${descLength > descMax ? 'text-red-400' : 'text-gray-400'}`}>
                      {descLength} / {descMax}
                    </span>
                  </div>
                </div>

                {/* URL */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-400" />
                      Page URL
                    </span>
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/page"
                    className="input"
                  />
                </div>

                {/* Site Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Site Name (optional)</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Your Website"
                    className="input"
                  />
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Image
                </h2>

                {/* Image URL */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                    className="input"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    Recommended dimension: <span className="text-white">1200 x 630 pixels</span>. Must be an absolute URL.
                  </p>
                </div>

                {/* Image Preview */}
                <div className="aspect-[1.91/1] bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <div className={`flex flex-col items-center text-gray-500 ${imageUrl ? 'hidden' : ''}`}>
                    <Upload className="w-10 h-10 mb-2" />
                    <span className="text-sm">Enter an image URL above</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter (optional)
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Twitter Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value.replace('@', ''))}
                      placeholder="username"
                      className="input pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Code Output */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Code
                  </h2>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
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
                
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm max-h-[600px] overflow-y-auto">
                  <code className="text-gray-300">
                    {generateCode().split('\n').map((line, i) => {
                      // Syntax highlighting
                      let highlighted = line
                      
                      // Comments
                      if (line.startsWith('<!--')) {
                        return <div key={i} className="text-gray-500">{line}</div>
                      }
                      
                      // Tags and attributes
                      highlighted = line
                        .replace(/(&lt;|<)(\/?\w+)/g, '<span class="text-gray-400">$1</span><span class="text-purple-400">$2</span>')
                        .replace(/(name|property|content)=/g, '<span class="text-cyan-400">$1</span>=')
                        .replace(/"([^"]+)"/g, '"<span class="text-green-400">$1</span>"')
                      
                      return (
                        <div 
                          key={i} 
                          dangerouslySetInnerHTML={{ __html: highlighted }}
                        />
                      )
                    })}
                  </code>
                </pre>

                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-purple-300">
                    <strong>Tip:</strong> Paste this code in the <code className="bg-purple-500/20 px-1 rounded">&lt;head&gt;</code> section of your HTML document.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
