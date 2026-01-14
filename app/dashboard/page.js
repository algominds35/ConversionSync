import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getUserByEmail, getMonthlyStats } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import DashboardClient from './DashboardClient'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const user = await getUserByEmail(session.user.email)
  const stats = await getMonthlyStats(user.id)
  
  const isConnected = user.google_ads_customer_id && user.google_refresh_token

  return <DashboardClient 
    session={session} 
    user={user} 
    stats={stats} 
    isConnected={isConnected} 
  />
}
