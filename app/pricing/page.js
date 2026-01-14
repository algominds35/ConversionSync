import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            ConversionSync
          </Link>
          <div className="space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Pricing */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Choose the plan that fits your needs
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                $0<span className="text-lg text-gray-600">/mo</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>10 conversions/month</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Basic features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Email support (48hr)</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Starter Tier */}
            <div className="bg-indigo-600 text-white p-8 rounded-lg shadow-lg transform scale-105">
              <div className="inline-block bg-yellow-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full mb-2">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-4">
                $79<span className="text-lg opacity-80">/mo</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>500 conversions/month</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>All features</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Priority support (24hr)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Conversion history</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full bg-white text-indigo-600 py-3 rounded-lg hover:bg-gray-100 font-bold"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Agency Tier */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Agency</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                $299<span className="text-lg text-gray-600">/mo</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Unlimited conversions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Multi-client management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Dedicated support (4hr)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>API access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Custom integrations</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto text-left space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">Can I change plans anytime?</h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">
                  Yes! All paid plans come with a 14-day free trial. No credit card required to start.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, Mastercard, AmEx) via Stripe.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600">
                  Yes! Cancel anytime with one click. No contracts, no cancellation fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-gray-600 mt-20">
        <p>&copy; 2026 ConversionSync. All rights reserved.</p>
      </footer>
    </div>
  )
}
