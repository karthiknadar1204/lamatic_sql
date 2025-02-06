'use client'

import React, { useState } from 'react'
import { Plus, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Connections from '../_components/connections'
import { embeddings } from '../actions/chat'

const Page = () => {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const validateInputs = () => {
    const postgresUrlRegex = /^postgres(ql)?:\/\/[^\s]+$/
    
    if (!url) {
      setError('Please enter a PostgreSQL URL')
      return false
    }

    if (!name) {
      setError('Please enter a connection name')
      return false
    }

    if (!postgresUrlRegex.test(url)) {
      setError('Please enter a valid PostgreSQL URL (starts with postgres:// or postgresql://)')
      return false
    }

    setError('')
    return true
  }

  const handleSubmit = async () => {
    if (!validateInputs()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/connectDb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postgresUrl: url,
          connectionName: name
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to connect to database')
      }

      const data = await response.json()
      console.log('Connection successful:', data)
      await embeddings(data)
      setShowModal(false)
      setUrl('')
      setName('')
      setRefreshKey(prev => prev + 1)

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <button
        onClick={() => router.push('/')}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Main Page
      </button>

      <div className="flex gap-8">
        <div 
          className="w-64 h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-12 h-12 text-gray-400" />
        </div>

        <Connections refreshTrigger={refreshKey} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add New Collection</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PostgreSQL URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter PostgreSQL URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter collection name"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Connect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page