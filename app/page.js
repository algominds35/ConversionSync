import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">ConversionSync</div>
          <div className="space-x-4">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Start Free Trial
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Stop Wrestling With Google Ads <span className="text-indigo-600">Offline Conversion Uploads</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            For agencies & marketers tired of spreadsheet hell, timezone confusion, and low match rates
          </p>

          <Link href="/auth/signup" className="inline-block bg-indigo-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-indigo-700 shadow-lg">
            Start Free Trial - 10 Conversions Free
          </Link>

          {/* Problems */}
          <div className="mt-20 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">The Problem:</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-red-500 text-2xl mb-2">❌</div>
                <h3 className="font-bold mb-2">Confusing CSV templates</h3>
                <p className="text-gray-600">One wrong format breaks everything</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-red-500 text-2xl mb-2">❌</div>
                <h3 className="font-bold mb-2">Timezone format issues</h3>
                <p className="text-gray-600">"Lost a full day figuring this out"</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-red-500 text-2xl mb-2">❌</div>
                <h3 className="font-bold mb-2">Pre-hashing confusion</h3>
                <p className="text-gray-600">SHA-256? Lowercase? What?</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-red-500 text-2xl mb-2">❌</div>
                <h3 className="font-bold mb-2">30-60% match rates</h3>
                <p className="text-gray-600">Losing 40% of your conversion data!</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-red-500 text-2xl mb-2">❌</div>
                <h3 className="font-bold mb-2">30+ minutes per client</h3>
                <p className="text-gray-600">With 20 clients = 10 hours/month wasted</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-red-500 text-2xl mb-2">❌</div>
                <h3 className="font-bold mb-2">Technical knowledge required</h3>
                <p className="text-gray-600">Not everyone knows how to hash data</p>
              </div>
            </div>
          </div>

          {/* Solution */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Simple Offline Conversion Tracking That Just Works</h2>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="text-green-500 text-2xl mr-4">✅</div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Capture conversions in a simple form</h3>
                    <p className="text-gray-600">No spreadsheets, no CSV files</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-green-500 text-2xl mr-4">✅</div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">We handle ALL the technical formatting</h3>
                    <p className="text-gray-600">Hashing, timezone, date format - done automatically</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-green-500 text-2xl mr-4">✅</div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Auto-uploads to Google Ads</h3>
                    <p className="text-gray-600">Perfect format, every time</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-green-500 text-2xl mr-4">✅</div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">80%+ match rates</h3>
                    <p className="text-gray-600">vs 30-60% with DIY methods</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-green-500 text-2xl mr-4">✅</div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Zero technical knowledge required</h3>
                    <p className="text-gray-600">If you can fill out a form, you can use this</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Simple Pricing</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ 10 conversions/month</li>
                  <li>✓ Basic features</li>
                  <li>✓ Email support</li>
                </ul>
                <Link href="/auth/signup" className="block text-center bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300">
                  Start Free
                </Link>
              </div>

              <div className="bg-indigo-600 text-white p-8 rounded-lg shadow-lg transform scale-105">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-4xl font-bold mb-4">$79<span className="text-lg">/mo</span></div>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ 500 conversions/month</li>
                  <li>✓ All features</li>
                  <li>✓ Priority support</li>
                </ul>
                <Link href="/auth/signup" className="block text-center bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-bold">
                  Start Trial
                </Link>
              </div>

              <div className="bg-white p-8 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">Agency</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$299<span className="text-lg">/mo</span></div>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ Unlimited conversions</li>
                  <li>✓ Multi-client management</li>
                  <li>✓ Dedicated support</li>
                </ul>
                <Link href="/auth/signup" className="block text-center bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300">
                  Start Trial
                </Link>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 bg-indigo-600 text-white p-12 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Ready to Stop the Spreadsheet Madness?</h2>
            <p className="text-xl mb-8">Start with 10 free conversions. No credit card required.</p>
            <Link href="/auth/signup" className="inline-block bg-white text-indigo-600 text-lg px-8 py-4 rounded-lg hover:bg-gray-100 shadow-lg font-bold">
              Start Free Trial
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-gray-600">
        <p>&copy; 2026 ConversionSync. All rights reserved.</p>
      </footer>
    </div>
  )
}
