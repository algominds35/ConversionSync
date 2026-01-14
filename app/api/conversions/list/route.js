import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getConversionsByUser, getUserByEmail } from '@/lib/db'

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get conversions
    const conversions = await getConversionsByUser(user.id)

    return NextResponse.json({
      conversions
    })

  } catch (error) {
    console.error('List conversions error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
