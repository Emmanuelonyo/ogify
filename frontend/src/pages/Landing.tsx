import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  Link as LinkIcon, 
  Image, 
  Zap, 
  Lock, 
  BarChart3, 
  Code, 
  ArrowRight,
  Github,
  ChevronRight,
  Check
} from 'lucide-react'

const features = [
  {
    icon: LinkIcon,
    title: 'URL Metadata Extraction',
    description: 'Extract OpenGraph, Twitter Card, and meta tags from any URL in milliseconds.',
  },
  {
    icon: Image,
    title: 'Dynamic OG Images',
    description: 'Generate beautiful, customizable Open Graph images on the fly with multiple templates.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Redis + PostgreSQL caching delivers sub-100ms responses for cached requests.',
  },
  {
    icon: Lock,
    title: 'Secure & Reliable',
    description: 'API key authentication with per-key rate limits and permissions.',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Track API calls, cache hit rates, and performance metrics in real-time.',
  },
  {
    icon: Code,
    title: 'Developer First',
    description: 'Clean REST API with comprehensive docs, SDKs, and code examples.',
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['1,000 requests/month', '24h cache TTL', '1 API key', 'Community support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$19',
    period: '/month',
    features: ['25,000 requests/month', '7 day cache TTL', '5 API keys', 'Email support', 'Custom templates'],
    cta: 'Start Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    features: ['100,000 requests/month', '30 day cache TTL', 'Unlimited API keys', 'Priority support', 'Custom templates', 'Webhooks'],
    cta: 'Start Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited requests', 'Custom cache TTL', 'Dedicated support', 'SLA guarantee', 'On-premise option'],
    cta: 'Contact Sales',
    popular: false,
  },
]

const codeExample = `// Extract metadata from any URL
const response = await fetch(
  'https://ogify.io/api/v1/extract?url=https://github.com',
  { headers: { 'X-API-Key': 'og_xxx' } }
);

const { data } = await response.json();
console.log(data.openGraph);
// { title: 'GitHub', description: '...', image: '...' }`

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  
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
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Docs</Link>
            <Link to="/playground" className="text-gray-400 hover:text-white transition-colors">Debugger</Link>
            <Link to="/generator" className="text-gray-400 hover:text-white transition-colors">Generator</Link>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
                <Link to="/signup" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-sm text-gray-300 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Now in public beta
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            OpenGraph API for{' '}
            <span className="gradient-text">modern apps</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Extract metadata from any URL and generate dynamic OG images with a simple API. 
            Built for speed, reliability, and developer experience.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary flex items-center gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/docs" className="btn-secondary flex items-center gap-2">
              <Code className="w-4 h-4" /> Read the docs
            </Link>
          </div>
        </div>
        
        {/* Code preview */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="card glow p-1">
            <div className="bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-gray-500">example.ts</span>
              </div>
              <pre className="p-6 text-sm overflow-x-auto">
                <code className="text-gray-300">{codeExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-gray-400 text-lg">Powerful features for extracting and generating Open Graph data</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card p-6 hover:border-gray-700 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary-600/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Try it live</h2>
          <p className="text-gray-400 text-lg mb-8">See the API in action with our interactive playground</p>
          <Link to="/playground" className="btn-primary inline-flex items-center gap-2">
            Open Playground <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400 text-lg">Start free, scale as you grow</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`card p-6 ${plan.popular ? 'border-primary-500 glow' : ''}`}>
                {plan.popular && (
                  <div className="text-primary-400 text-sm font-medium mb-2">Most popular</div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-2 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            Ogify
          </div>
          
          <div className="flex items-center gap-6 text-gray-400">
            <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="https://github.com" target="_blank" rel="noopener" className="hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-gray-500 text-sm">© 2026 Ogify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
