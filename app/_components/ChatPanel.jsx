'use client'

import React, { useEffect, useState } from 'react'
import { getChatHistory } from '../actions/chat'
import { submitChat } from '../actions/chatAction'
import Message from './messages/Message'

const ChatPanel = React.forwardRef(({ connectionId }, ref) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const previousChats = await getChatHistory(connectionId)
        setMessages(previousChats)
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [connectionId])

  const handleSubmit = async (input) => {
    setIsSubmitting(true)
    

    const optimisticMessage = {
      id: Date.now(),
      message: input,
      response: JSON.stringify({
        type: 'loading',
        content: {
          summary: 'Thinking...',
          details: ['Processing your request...'],
        }
      }),
      temporary: true
    }
    
    setMessages(prev => [...prev, optimisticMessage])

    const formData = new FormData()
    formData.append('input', input)
    formData.append('connectionId', connectionId)
    
    try {
      const response = await submitChat(formData)
      if (!response.error) {

        setMessages(prev => {
          const filtered = prev.filter(msg => !msg.temporary)
          return [...filtered, {
            id: response.id,
            message: input,
            response: JSON.stringify(response.response)
          }]
        })
      }
    } catch (error) {
      console.error('Error submitting chat:', error)

      setMessages(prev => prev.filter(msg => !msg.temporary))
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useImperativeHandle(ref, () => ({
    handleSubmit
  }))

  if (loading) return <div>Loading messages...</div>

  return (
    <div className="flex flex-col gap-6 pb-24">
      {messages.map((msg, index) => (
        <Message 
          key={`${msg.id}-${index}`} 
          message={msg} 
          isLoading={msg.temporary}
        />
      ))}
    </div>
  )
})

ChatPanel.displayName = 'ChatPanel'

export default ChatPanel