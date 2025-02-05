'use client'

import { AnalysisMessage } from './AnalysisMessage'
import { QuestionMessage } from './QuestionMessage'
import { VisualizationMessage } from './VisualizationMessage'

const Message = ({ message, onSubmit }) => {
  let parsedResponse
  try {
    parsedResponse = typeof message.response === 'string' 
      ? JSON.parse(message.response) 
      : message.response
  } catch (e) {
    console.error('Error parsing message:', e)
    return null
  }

  const messageType = parsedResponse.question 
    ? 'question' 
    : parsedResponse.type === 'visualization'
    ? 'visualization'
    : parsedResponse.type

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      <div className="flex justify-end">
        <div className="bg-blue-100 rounded-lg p-4 max-w-[80%]">
          <p className="text-sm">{message.message}</p>
        </div>
      </div>

      <div className="flex justify-start">
        {messageType === 'question' ? (
          <QuestionMessage response={parsedResponse} onSubmit={onSubmit} />
        ) : messageType === 'visualization' ? (
          <VisualizationMessage response={parsedResponse} />
        ) : messageType === 'analysis' ? (
          <AnalysisMessage response={parsedResponse} />
        ) : (
          <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
            <p className="text-sm">Unsupported message type</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Message 