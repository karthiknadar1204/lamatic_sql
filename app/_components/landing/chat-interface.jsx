'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

const tables = [
  { name: "Products", columns: 12, rows: 234 },
  { name: "Sales", columns: 8, rows: 1234 },
  { name: "Customers", columns: 10, rows: 567 },
]

export default function ChatInterface() {
    // ontainer mx-auto px-4 md:px-6 ml-32
  return (
    <section className="w-full py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 ml-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Chat with Your Data</h2>
          <p className="text-gray-600">Ask questions about your data in natural language and get instant insights</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Available Tables */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Available Tables</h3>
            <div className="space-y-4">
              {tables.map((table) => (
                <div key={table.name} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium">{table.name}</h4>
                  <p className="text-sm text-gray-500">
                    {table.columns} columns • {table.rows} rows
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p>Hello! I'm your data assistant. What would you like to know about your database?</p>
            </div>

            <div className="bg-red-500 text-white p-3 rounded-lg inline-block mb-4">
              Show me the total sales by product category
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p>Here's the visualization of total sales by product category:</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 mt-2 flex items-center justify-center">
                <p className="text-gray-500">Chart Visualization Area</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input placeholder="Ask a question about your data..." className="flex-1" />
              <Button className="bg-red-500 hover:bg-red-600">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
