import React, { useEffect, useRef, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { supabase } from '@/integrations/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Msg = { id: number; sender_id: string; receiver_id: string; body: string; created_at: string }

export default function MessagesPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [peerId, setPeerId] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !peerId) return
      const sb: any = supabase
      const { data } = await sb
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
      setMessages(((data as unknown) as Msg[]) || [])

      const channel = sb
        .channel('chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
          const m = payload.new as Msg
          if ((m.sender_id === user.id && m.receiver_id === peerId) || (m.sender_id === peerId && m.receiver_id === user.id)) {
            setMessages((prev) => [...prev, m])
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    })()
  }, [peerId])

  const send = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !peerId || !text.trim()) return
    await supabase.from('messages').insert({ sender_id: user.id, receiver_id: peerId, body: text.trim() })
    setText('')
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <div className="flex gap-2">
          <Input placeholder="Enter user id to chat" value={peerId} onChange={(e) => setPeerId(e.target.value)} />
          <Button onClick={() => {}}>Open</Button>
        </div>
        <div className="border rounded-md h-[500px] overflow-y-auto p-4 bg-white">
          {messages.map((m) => (
            <div key={m.id} className="mb-2">
              <div className="text-sm text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
              <div>{m.body}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2">
          <Input placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} />
          <Button onClick={send}>Send</Button>
        </div>
      </div>
    </MainLayout>
  )
}


