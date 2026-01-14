'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email) {
      fetchUser()
    }
  }, [session])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Google Ads account?')) {
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/google-ads/disconnect', {
        method: 'POST'
      })

      if (res.ok) {
        setMessage('✅ Google Ads disconnected successfully')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        const data = await res.json()
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to disconnect')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
              ConversionSync
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{session?.user?.email}</span>
              <Link
                href="/dashboard"
                className="text-indigo-600 hover:text-indigo-800"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Account Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <input
                type="text"
                value={user?.subscription_tier || 'free'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 capitalize"
              />
            </div>
          </div>
        </div>

        {/* Google Ads Connection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Google Ads Connection</h2>
          {user?.google_ads_customer_id ? (
            <div>
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium mb-2">✅ Connected</p>
                <p className="text-sm text-green-700">
                  Customer ID: {user.google_ads_customer_id}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Disconnecting...' : 'Disconnect Google Ads'}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                No Google Ads account connected.
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Connect Google Ads
              </Link>
            </div>
          )}
        </div>

        {/* Subscription Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Subscription</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 mb-2">
                Current Plan: <span className="font-bold capitalize">{user?.subscription_tier || 'Free'}</span>
              </p>
              <p className="text-sm text-gray-500">
                {user?.subscription_tier === 'free' 
                  ? '10 conversions per month'
                  : user?.subscription_tier === 'starter'
                  ? '500 conversions per month'
                  : 'Unlimited conversions'
                }
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. All your data will be permanently deleted.
          </p>
          <button
            onClick={() => alert('Account deletion feature coming soon. Please contact support to delete your account.')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  )
}
