import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserByEmail, getMonthlyStats, createUser } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

export default async function Dashboard() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  let user = await getUserByEmail(session.user.email)
  
  // If user doesn't exist in database, create them (for OAuth users)
  if (!user && session.user.email) {
    try {
      user = await createUser(session.user.email, null)
    } catch (error) {
      console.error('Error creating user:', error)
      redirect('/auth/signin')
    }
  }
  
  if (!user) {
    redirect('/auth/signin')
  }
  
  const stats = await getMonthlyStats(user.id)
  
  const isConnected = user.google_ads_customer_id && user.google_refresh_token

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session.user.email}</span>
            <Link href="/api/auth/signout" className="text-sm text-gray-500 hover:text-gray-700">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-yellow-900 mb-2">
              ⚠️ Connect Your Google Ads Account
            </h3>
            <p className="text-yellow-700 mb-4">
              To upload conversions, you need to connect your Google Ads account first.
            </p>
            <Link href="/connect" className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700">
              Connect Now
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 mb-1">This Month</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Conversions</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 mb-1">Successful</div>
            <div className="text-3xl font-bold text-green-600">{stats.successful}</div>
            <div className="text-sm text-gray-600">{stats.successRate}% success rate</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 mb-1">Failed</div>
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Uploads</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500 mb-1">Total Value</div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-gray-600">This month</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/upload"
              className="block p-6 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition"
            >
              <div className="text-3xl mb-2">📤</div>
              <h3 className="font-bold text-lg mb-1">Upload Conversion</h3>
              <p className="text-sm text-gray-600">Add a new offline conversion</p>
            </Link>

            <Link 
              href="/history"
              className="block p-6 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition"
            >
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-lg mb-1">View History</h3>
              <p className="text-sm text-gray-600">See all uploaded conversions</p>
            </Link>

            <Link 
              href="/settings"
              className="block p-6 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition"
            >
              <div className="text-3xl mb-2">⚙️</div>
              <h3 className="font-bold text-lg mb-1">Settings</h3>
              <p className="text-sm text-gray-600">Manage your account</p>
            </Link>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg mb-1">Current Plan: {user.subscription_tier || 'Free'}</h3>
              <p className="text-sm text-gray-600">
                {user.subscription_tier === 'free' && '10 conversions/month included'}
                {user.subscription_tier === 'starter' && '500 conversions/month'}
                {user.subscription_tier === 'pro' && '2,000 conversions/month'}
                {user.subscription_tier === 'agency' && 'Unlimited conversions'}
              </p>
            </div>
            {user.subscription_tier === 'free' && (
              <Link href="/pricing" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
