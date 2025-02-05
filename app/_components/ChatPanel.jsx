'use client'

import React, { useEffect, useState } from 'react'
import { getChatHistory } from '../actions/chat'
import { submitChat } from '../actions/chatAction'
import Message from './messages/Message'

const ChatPanel = ({ connectionId }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const previousChats = await getChatHistory(connectionId)
        console.log(previousChats)
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
    const formData = new FormData()
    formData.append('input', input)
    formData.append('connectionId', connectionId)
    
    try {
      const response = await submitChat(formData)
      if (!response.error) {
        const updatedChats = await getChatHistory(connectionId)
        setMessages(updatedChats)
      }
    } catch (error) {
      console.error('Error submitting chat:', error)
    }
  }

  if (loading) return <div>Loading messages...</div>

  return (
    <div className="flex flex-col gap-6 pb-24">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} onSubmit={handleSubmit} />
      ))}
    </div>
  )
}

export default ChatPanel