'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getDbData } from '@/app/actions/chat'
import { submitChat } from '@/app/actions/chatAction'
import ChatPanel from '@/app/_components/ChatPanel'

const Page = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDbData(id)
        console.log(result)
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
    
    const formData = new FormData()
    formData.append('input', input)
    formData.append('connectionId', id)
    
    try {
      const response = await submitChat(formData)
      if (response.error) {
        setError(response.error)
      } else {
        console.log(response)
      }
    } catch (err) {
      setError('Failed to send message')
    }
    
    setInput('')
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Chat</h1>
      <ChatPanel connectionId={id} />
      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-white">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button 
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            →
          </button>
        </div>
      </form>
    </div>
  )
}

export default Page