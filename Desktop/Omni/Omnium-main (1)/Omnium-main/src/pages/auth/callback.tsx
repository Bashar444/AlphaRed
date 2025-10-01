import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState<string>('Confirming your email...')

  useEffect(() => {
    const hash = window.location.hash
    const query = window.location.search

    async function handleCallback() {
      try {
        // Supabase can parse tokens from URL automatically
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        // If no session yet, attempt to set session from URL (older flows)
        if (!data.session && (hash || query)) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (exchangeError) throw exchangeError
        }

        setStatus('success')
        setMessage('Your email has been confirmed. You are now signed in!')
      } catch (e: any) {
        setStatus('error')
        const desc = new URLSearchParams(window.location.hash.replace('#', '')).get('error_description')
          || new URLSearchParams(window.location.search).get('error_description')
          || e?.message
          || 'There was a problem confirming your email.'
        setMessage(desc)
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Account Confirmation</CardTitle>
          <CardDescription>
            {status === 'pending' && 'Please wait while we confirm your email...'}
            {status === 'success' && 'Your account is ready!'}
            {status === 'error' && 'We could not complete the confirmation.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className={status === 'error' ? 'text-red-600 mb-4' : 'text-gray-700 mb-4'}>{message}</p>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Go to Home
            </Button>
            <Button variant="outline" onClick={() => router.push('/auth')}>Back to Auth</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


