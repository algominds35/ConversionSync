import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserByEmail } from '@/lib/db'
import { getConversionActions } from '@/lib/googleAds'
import UploadForm from '@/components/UploadForm'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function UploadPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const user = await getUserByEmail(session.user.email)
  
  // Check if user has connected Google Ads
  if (!user.google_ads_customer_id || !user.google_refresh_token) {
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
          <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-yellow-900 mb-4">
              Connect Google Ads First
            </h2>
            <p className="text-yellow-700 mb-6">
              Before you can upload conversions, you need to connect your Google Ads account.
            </p>
            <Link href="/connect" className="inline-block bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700">
              Connect Google Ads
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Get conversion actions
  let conversionActions = []
  try {
    conversionActions = await getConversionActions(
      user.google_ads_customer_id,
      user.google_refresh_token
    )
  } catch (error) {
    console.error('Error fetching conversion actions:', error)
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
        <UploadForm conversionActions={conversionActions} />
      </main>
    </div>
  )
}
