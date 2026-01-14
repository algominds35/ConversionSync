import CryptoJS from 'crypto-js'
import { formatInTimeZone } from 'date-fns-tz'

/**
 * Hash email for Google Ads enhanced conversions
 * Must be lowercase, trimmed, then SHA-256 hashed
 */
export function hashEmail(email) {
  if (!email) return null
  const normalized = email.toLowerCase().trim()
  return CryptoJS.SHA256(normalized).toString()
}

/**
 * Hash phone number for Google Ads enhanced conversions
 * Remove spaces, dashes, parentheses, then SHA-256 hash
 */
export function hashPhone(phone) {
  if (!phone) return null
  const normalized = phone.replace(/[\s\-\(\)]/g, '')
  return CryptoJS.SHA256(normalized).toString()
}

/**
 * Format date for Google Ads API
 * Format: YYYY-MM-DD HH:MM:SS±HH:MM
 * Example: 2026-01-15 14:30:00-05:00
 */
export function formatDateForGoogleAds(date, timezone = 'America/New_York') {
  // Convert to ISO 8601 format with timezone
  // Google Ads expects: yyyy-MM-dd HH:mm:ss±HH:mm
  return formatInTimeZone(date, timezone, "yyyy-MM-dd HH:mm:ssXXX")
}

/**
 * Validate GCLID format
 */
export function isValidGclid(gclid) {
  if (!gclid) return false
  // GCLID typically starts with "GCL." or "Cj0" or is alphanumeric
  return /^[a-zA-Z0-9\._-]+$/.test(gclid) && gclid.length > 5
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
