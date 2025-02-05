'use client'

export const LoadingMessage = () => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 max-w-[80%] min-w-[200px]">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-gray-500">AI is thinking...</span>
      </div>
    </div>
  )
} 