import React, { useEffect, useRef, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

export default function ProfileSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    })()
  }, [])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    try {
      const updates = {
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        username: profile.username || null,
        title: profile.title || null,
        company: profile.company || null,
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) throw error
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const onAvatarPick = async (f: File | null) => {
    if (!f) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const path = `${user.id}/${Date.now()}-${f.name}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, f)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = data.publicUrl
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      if (error) throw error
      setProfile((p: any) => ({ ...p, avatar_url: url }))
      toast({ title: 'Avatar updated' })
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message || 'Could not upload avatar', variant: 'destructive' })
    }
  }

  if (loading) return (
    <MainLayout>
      <div className="p-8">Loading...</div>
    </MainLayout>
  )

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information and avatar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarPick(e.target.files?.[0] || null)} />
                  <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>Change Photo</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" value={profile?.first_name || ''} onChange={(e) => setProfile((p: any) => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" value={profile?.last_name || ''} onChange={(e) => setProfile((p: any) => ({ ...p, last_name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={profile?.username || ''} onChange={(e) => setProfile((p: any) => ({ ...p, username: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={profile?.title || ''} onChange={(e) => setProfile((p: any) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={profile?.company || ''} onChange={(e) => setProfile((p: any) => ({ ...p, company: e.target.value }))} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>Save changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}


