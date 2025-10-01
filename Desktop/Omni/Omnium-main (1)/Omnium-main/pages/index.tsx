import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { FeedPage } from '@/components/feed/FeedPage'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/router'

export default function IndexPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Omnium</h2>
          <p className="text-gray-500">Preparing your professional ecosystem...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (typeof window !== 'undefined') router.replace('/auth')
    return null
  }

  return (
    <MainLayout>
      <FeedPage />
    </MainLayout>
  )
}
