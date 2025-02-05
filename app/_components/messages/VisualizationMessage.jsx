'use client'

export const VisualizationMessage = ({ response }) => {
  const content = response.data?.content || response.content

  return (
    <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
      <div className="space-y-3">
        <p className="font-medium">{content.summary}</p>
        
        <div className="mt-4 space-y-2">
          {content.details.map((detail, index) => (
            <div key={index} className="p-3 bg-white rounded-md shadow-sm">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{detail.split(':')[0]}:</span>
                {detail.split(':')[1]}
              </p>
            </div>
          ))}
        </div>

        {content.metrics && Object.keys(content.metrics).length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="font-medium mb-2">Key Metrics:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(content.metrics).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="text-gray-600">{key}:</span>{' '}
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 