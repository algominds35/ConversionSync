'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function UploadForm({ conversionActions }) {
  const [formData, setFormData] = useState({
    gclid: '',
    email: '',
    phone: '',
    conversionDateTime: '',
    conversionValue: '',
    currencyCode: 'USD',
    conversionAction: conversionActions?.[0]?.resourceName || '',
  })

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/conversions/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload conversion')
      }

      setSuccess(true)
      setResult(data.conversion)

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          gclid: '',
          email: '',
          phone: '',
          conversionDateTime: '',
          conversionValue: '',
          currencyCode: 'USD',
          conversionAction: formData.conversionAction,
        })
        setSuccess(false)
        setResult(null)
      }, 3000)

    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Offline Conversion</h2>

      {success && result && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-700 text-lg font-bold mb-2">
            ✅ Conversion uploaded successfully!
          </div>
          <div className="text-sm text-green-600">
            <p>GCLID: {result.gclid}</p>
            <p>Value: {formatCurrency(result.conversion_value, result.currency_code)}</p>
            <p>Uploaded at: {new Date(result.created_at).toLocaleString()}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GCLID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GCLID *
          </label>
          <input
            type="text"
            name="gclid"
            value={formData.gclid}
            onChange={handleChange}
            required
            placeholder="GCL.1234567890 or from URL parameter"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Google Click ID from the ad click URL
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (optional but recommended)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="customer@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Improves match rate (we hash it automatically)
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone (optional but recommended)
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1-555-123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Improves match rate (we hash it automatically)
          </p>
        </div>

        {/* Conversion Date/Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversion Date & Time *
          </label>
          <input
            type="datetime-local"
            name="conversionDateTime"
            value={formData.conversionDateTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            When the conversion happened (we handle timezone automatically)
          </p>
        </div>

        {/* Conversion Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversion Value *
          </label>
          <div className="flex gap-4">
            <input
              type="number"
              name="conversionValue"
              value={formData.conversionValue}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="150.00"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>

        {/* Conversion Action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversion Action Resource Name *
          </label>
          <input
            type="text"
            name="conversionAction"
            value={formData.conversionAction}
            onChange={handleChange}
            required
            placeholder="customers/1208386429/conversionActions/123456789"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-900">
              <strong>How to find your conversion action resource name:</strong>
              <br />
              1. Go to <a href="https://ads.google.com/aw/conversions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ads → Conversions</a>
              <br />
              2. Click on your conversion action (e.g., "Purchase")
              <br />
              3. Look at the URL bar - it contains the resource name
              <br />
              4. Format: <code className="bg-yellow-100 px-1">customers/YOUR_CUSTOMER_ID/conversionActions/ACTION_ID</code>
              <br />
              <br />
              <strong>Example:</strong> customers/1208386429/conversionActions/987654321
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
        >
          {uploading ? 'Uploading...' : 'Upload Conversion'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>What we handle for you:</strong>
          <br />
          ✓ SHA-256 hashing of email/phone
          <br />
          ✓ Timezone formatting
          <br />
          ✓ Date format conversion
          <br />
          ✓ API authentication
          <br />
          ✓ Error handling
        </p>
      </div>
    </div>
  )
}
