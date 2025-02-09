'use client'

import { createContext, useContext } from 'react'

export const AIStateContext = createContext(null)

export function useAIState() {
  const context = useContext(AIStateContext)
  if (!context) {
    throw new Error('useAIState must be used within an AIStateProvider')
  }
  return context
} 