'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Copy } from 'lucide-react'

const SchemaViewer = ({ data }) => {
  const [selectedTable, setSelectedTable] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleCopyUrl = () => {
    if (data?.[0]?.postgresUrl) {
      navigator.clipboard.writeText(data[0].postgresUrl)
        .then(() => {
          console.log('URL copied to clipboard')
        })
        .catch(err => {
          console.error('Failed to copy URL:', err)
        })
    }
  }

  const handleTableClick = (table) => {
    setSelectedTable(table)
  }

  const renderContent = () => {
    if (selectedTable) {
      return (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{selectedTable.tableName}</h3>
            <button 
              onClick={() => setSelectedTable(null)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Back to Tables
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Data Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedTable.columns.map((column, index) => (
                <TableRow key={index}>
                  <TableCell>{column.column_name}</TableCell>
                  <TableCell>{column.data_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {data?.[0]?.tableSchema?.map((table) => (
          <button
            key={table.tableName}
            onClick={() => handleTableClick(table)}
            className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium">{table.tableName}</p>
            <p className="text-sm text-gray-500 mt-1">
              {table.columns.length} columns
            </p>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 absolute top-4 right-4">
      <button
        onClick={handleCopyUrl}
        className="p-2 hover:bg-gray-100 rounded-md"
        title="Copy Database URL"
      >
        <Copy className="w-5 h-5" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Schema
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTable ? `Table: ${selectedTable.tableName}` : 'Database Schema'}
            </DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SchemaViewer 