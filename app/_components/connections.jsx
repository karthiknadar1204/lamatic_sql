'use client'

import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const Connections = () => {
  const router = useRouter()
  const { user } = useUser()
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/connections')
        if (!response.ok) {
          throw new Error('Failed to fetch connections')
        }
        const data = await response.json()
        setConnections(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchConnections()
    }
  }, [user])

  if (loading) {
    return <div>Loading connections...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Connections</h2>
      {connections.length === 0 ? (
        <p>No connections found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <div 
              key={connection.id}
              className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/chats/${connection.id}`)}
            >
              <h3 className="font-semibold">{connection.connectionName}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Connections