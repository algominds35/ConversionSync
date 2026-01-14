'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ConnectGoogleAds from '@/components/ConnectGoogleAds'

export default function ConnectPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // After OAuth redirect, if we have a session with refreshToken and a pending customer ID
    if (session?.refreshToken && searchParams.get('step') === 'finalize') {
      const customerId = localStorage.getItem('pending_google_ads_customer_id')
      
      if (customerId) {
        setIsConnecting(true)
        
        // Complete the connection
        fetch('/api/google-ads/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customerId }),
        })
        .then(res => res.json())
        .then(data => {
          // Clear stored customer ID
          localStorage.removeItem('pending_google_ads_customer_id')
          
          if (data.success) {
            // Redirect to dashboard
            router.push('/dashboard')
          } else {
            alert('Failed to connect: ' + (data.error || 'Unknown error'))
            setIsConnecting(false)
          }
        })
        .catch(err => {
          alert('Error connecting: ' + err.message)
          localStorage.removeItem('pending_google_ads_customer_id')
          setIsConnecting(false)
        })
      }
    }
  }, [session, searchParams, router])

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold">Connecting Google Ads...</h2>
          <p className="text-gray-600 mt-2">Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <ConnectGoogleAds />
      </main>
    </div>
  )
}
