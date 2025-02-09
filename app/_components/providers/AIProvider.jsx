'use client'

import { useState, useCallback } from 'react'
import { AIStateContext } from '@/lib/ai-context'

export function AIProvider({ children }) {
  const [state, setState] = useState({
    messages: [],
    isStreaming: false
  })

  const dispatch = useCallback((action) => {
    switch (action.type) {
      case 'ADD_MESSAGE':
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, action.message]
        }))
        break
      case 'SET_STREAMING':
        setState(prev => ({
          ...prev,
          isStreaming: action.isStreaming
        }))
        break
      case 'UPDATE_MESSAGE':
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === action.messageId 
              ? { ...msg, ...action.updates }
              : msg
          )
        }))
        break
      default:
        console.warn('Unknown action type:', action.type)
    }
  }, [])

  return (
    <AIStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AIStateContext.Provider>
  )
} 