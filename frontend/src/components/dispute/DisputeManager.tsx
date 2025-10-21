'use client'

import { useState, useEffect } from 'react'
import { ChatBubbleLeftIcon, DocumentIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Dispute {
  id: number
  type: string
  status: string
  amount: number
  description: string
  created_at: string
  resolved_at: string | null
  buyer: { id: number; name: string }
  supplier: { id: number; name: string }
  resolution?: {
    buyer_refund: number
    supplier_payment: number
    platform_fee: number
    notes: string
  }
  messages: Array<{
    id: number
    user_id: number
    user_name: string
    message: string
    attachments: string[]
    created_at: string
  }>
}

export default function DisputeManager() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [resolutionData, setResolutionData] = useState({
    buyer_refund: 0,
    supplier_payment: 0,
    notes: ''
  })

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      const response = await fetch('/api/v1/disputes/')
      if (!response.ok) throw new Error('Failed to fetch disputes')
      const data = await response.json()
      setDisputes(data)
    } catch (error) {
      console.error('Error fetching disputes:', error)
      toast.error('Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  const fetchDisputeDetails = async (disputeId: number) => {
    try {
      const response = await fetch(`/api/v1/disputes/${disputeId}`)
      if (!response.ok) throw new Error('Failed to fetch dispute details')
      const data = await response.json()
      setSelectedDispute(data)
    } catch (error) {
      console.error('Error fetching dispute details:', error)
      toast.error('Failed to load dispute details')
    }
  }

  const handleSendMessage = async () => {
    if (!selectedDispute || !newMessage.trim()) return

    const formData = new FormData()
    formData.append('message', newMessage)
    attachments.forEach(file => {
      formData.append('attachments', file)
    })

    try {
      const response = await fetch(`/api/v1/disputes/${selectedDispute.id}/messages`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to send message')

      toast.success('Message sent successfully')
      setNewMessage('')
      setAttachments([])
      await fetchDisputeDetails(selectedDispute.id)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleResolveDispute = async () => {
    if (!selectedDispute) return

    try {
      const response = await fetch(`/api/v1/disputes/${selectedDispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolutionData)
      })

      if (!response.ok) throw new Error('Failed to resolve dispute')

      toast.success('Dispute resolved successfully')
      await fetchDisputes()
      setSelectedDispute(null)
    } catch (error) {
      console.error('Error resolving dispute:', error)
      toast.error('Failed to resolve dispute')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3 mt-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Disputes List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Active Disputes</h3>
            </div>
            <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {disputes.map((dispute) => (
                <li
                  key={dispute.id}
                  className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${
                    selectedDispute?.id === dispute.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => fetchDisputeDetails(dispute.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">
                        Dispute #{dispute.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Amount: ₹{dispute.amount.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        dispute.status === 'CLOSED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dispute Details */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <div className="bg-white shadow rounded-lg">
              {/* Dispute Header */}
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Dispute #{selectedDispute.id}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedDispute.type} - ₹{selectedDispute.amount.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedDispute.status === 'CLOSED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedDispute.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="px-4 py-5 sm:px-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {selectedDispute.messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex space-x-3"
                    >
                      <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {message.user_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-900">
                          {message.message}
                        </p>
                        {message.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <DocumentIcon className="h-4 w-4 mr-1" />
                                Attachment {index + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* New Message Input */}
                {selectedDispute.status !== 'CLOSED' && (
                  <div className="mt-4">
                    <div className="flex items-start space-x-4">
                      <div className="min-w-0 flex-1">
                        <div className="relative">
                          <textarea
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Add your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                          />
                        </div>
                        <div className="mt-2 flex justify-between">
                          <div className="flex items-center space-x-5">
                            <div className="flex items-center">
                              <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="sr-only"
                                id="attachment"
                              />
                              <label
                                htmlFor="attachment"
                                className="cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                Attach files
                              </label>
                            </div>
                            {attachments.length > 0 && (
                              <span className="text-sm text-gray-500">
                                {attachments.length} file(s) selected
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleSendMessage}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resolution Form (Admin Only) */}
                {selectedDispute.status !== 'CLOSED' && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900">
                      Resolve Dispute
                    </h4>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Buyer Refund (₹)
                        </label>
                        <input
                          type="number"
                          value={resolutionData.buyer_refund}
                          onChange={(e) =>
                            setResolutionData({
                              ...resolutionData,
                              buyer_refund: parseFloat(e.target.value)
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Supplier Payment (₹)
                        </label>
                        <input
                          type="number"
                          value={resolutionData.supplier_payment}
                          onChange={(e) =>
                            setResolutionData({
                              ...resolutionData,
                              supplier_payment: parseFloat(e.target.value)
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Resolution Notes
                      </label>
                      <textarea
                        rows={3}
                        value={resolutionData.notes}
                        onChange={(e) =>
                          setResolutionData({
                            ...resolutionData,
                            notes: e.target.value
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleResolveDispute}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Resolve Dispute
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No dispute selected
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a dispute from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
