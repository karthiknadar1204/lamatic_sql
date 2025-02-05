'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getDbData } from '@/app/actions/chat'
import { submitChat } from '@/app/actions/chatAction'
import ChatPanel from '@/app/_components/ChatPanel'
import { Loader2 } from 'lucide-react'

const Page = () => {
  const { id } = useParams()
  const chatPanelRef = useRef(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDbData(id)
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isSubmitting) return

    setIsSubmitting(true)
    setInput('') 
    
    try {
      if (chatPanelRef.current) {
        await chatPanelRef.current.handleSubmit(input)
      }
    } catch (err) {
      setError('Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Chat</h1>
      <ChatPanel 
        ref={chatPanelRef}
        connectionId={id} 
      />
      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-white">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg"
            disabled={isSubmitting}
          />
          <button 
            type="submit"
            disabled={isSubmitting || !input.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "→"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Page