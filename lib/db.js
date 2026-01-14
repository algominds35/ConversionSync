import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client for browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database helper functions
export async function getUserByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error) return null
  return data
}

export async function createUser(email, passwordHash) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        email,
        password_hash: passwordHash,
        subscription_tier: 'free',
      }
    ])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function savePendingCustomerId(email, customerId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      google_ads_customer_id: customerId,
    })
    .eq('email', email)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserGoogleAds(email, refreshToken) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      google_refresh_token: refreshToken,
    })
    .eq('email', email)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createConversion(conversionData) {
  const { data, error } = await supabaseAdmin
    .from('conversions')
    .insert([conversionData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getConversionsByUser(userId, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('conversions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function getMonthlyStats(userId) {
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabaseAdmin
    .from('conversions')
    .select('upload_status, conversion_value')
    .eq('user_id', userId)
    .gte('created_at', firstDayOfMonth.toISOString())
  
  if (error) throw error
  
  const total = data.length
  const successful = data.filter(c => c.upload_status === 'success').length
  const failed = data.filter(c => c.upload_status === 'failed').length
  const totalValue = data
    .filter(c => c.upload_status === 'success')
    .reduce((sum, c) => sum + parseFloat(c.conversion_value || 0), 0)
  
  return {
    total,
    successful,
    failed,
    totalValue,
    successRate: total > 0 ? (successful / total * 100).toFixed(1) : 0
  }
}
