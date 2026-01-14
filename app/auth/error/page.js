'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  let errorMessage = 'An error occurred during authentication'
  
  if (error === 'Configuration') {
    errorMessage = 'There is a problem with the server configuration.'
  } else if (error === 'AccessDenied') {
    errorMessage = 'You do not have permission to access this resource.'
  } else if (error === 'Verification') {
    errorMessage = 'The verification token has expired or has already been used.'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-8">{errorMessage}</p>
          <div className="space-y-3">
            <Link 
              href="/auth/signin" 
              className="block w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Try Again
            </Link>
            <Link 
              href="/" 
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
