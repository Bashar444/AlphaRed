
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserPlus, 
  Users, 
  MessageCircle,
  Filter,
  MapPin,
  Building
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const NetworkPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const handleImport = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return;
    const [header, ...rows] = lines;
    const cols = header.split(',').map((s) => s.trim().toLowerCase());
    const emailIdx = cols.indexOf('email');
    const fnIdx = cols.indexOf('first_name');
    const lnIdx = cols.indexOf('last_name');
    if (emailIdx === -1) return;
    const sb: any = supabase; // loosen types to avoid deep generic instantiation during build
    for (const row of rows.slice(0, 200)) {
      try {
        const parts = row.split(',');
        const email = parts[emailIdx];
        const firstName = fnIdx >= 0 ? parts[fnIdx] : undefined;
        const lastName = lnIdx >= 0 ? parts[lnIdx] : undefined;
        if (!email) continue;
        const { data: target } = await sb
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        if (target?.id) {
          const { data: { user } } = await sb.auth.getUser();
          if (user) {
            await sb
              .from('connections')
              .insert({ follower_id: user.id, following_id: target.id, status: 'pending' });
          }
        }
      } catch (_) {
        // skip problematic row
      }
    }
  };
  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('follower_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      // Manually fetch the following profiles
      if (!data || data.length === 0) return [];

      const followingIds = data.map(conn => conn.following_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followingIds);

      if (profilesError) throw profilesError;

      // Combine the data
      return data.map(connection => ({
        ...connection,
        following: profiles?.find(profile => profile.id === connection.following_id)
      }));
    },
  });

  const { data: suggestions } = useQuery({
    queryKey: ['connection-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('connections')
        .insert({ follower_id: user.id, following_id: targetId, status: 'pending' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Request sent', description: 'Connection request sent.' });
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
    },
    onError: () => toast({ title: 'Failed', description: 'Could not send request.', variant: 'destructive' }),
  });

  // Pending requests for me to accept/ignore
  const { data: incoming } = useQuery({
    queryKey: ['connection-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('following_id', user.id)
        .eq('status', 'pending');
      if (error) throw error;
      if (!data?.length) return [];
      const followerIds = data.map((c: any) => c.follower_id);
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followerIds);
      return data.map((c: any) => ({ ...c, follower: profs?.find((p: any) => p.id === c.follower_id) }));
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Connected' });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
    },
  });

  const ignoreMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Request ignored' });
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Network</h1>
        <Button onClick={() => document.getElementById('import-contacts-input')?.click()}>
          <Users className="h-4 w-4 mr-2" />
          Import Contacts
        </Button>
      </div>
      <input id="import-contacts-input" type="file" accept="text/csv" className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await handleImport(file);
        (e.target as HTMLInputElement).value = '';
      }} />

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search your network..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>People You May Know</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions?.slice(0, 6).map((person) => (
                  <div key={person.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={person.avatar_url} />
                      <AvatarFallback>
                        {person.first_name?.[0]}{person.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {person.first_name} {person.last_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{person.title}</p>
                      <p className="text-xs text-gray-500 truncate">{person.company}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" onClick={() => connectMutation.mutate(person.id)} disabled={connectMutation.isPending}>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Connect
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incoming?.length ? incoming.map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={req.follower?.avatar_url} />
                        <AvatarFallback>
                          {req.follower?.first_name?.[0]}{req.follower?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{req.follower?.first_name} {req.follower?.last_name}</p>
                        <p className="text-sm text-gray-500">{req.follower?.title}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptMutation.mutate(req.id)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => ignoreMutation.mutate(req.id)}>Ignore</Button>
                    </div>
                  </div>
                )) : <p className="text-gray-500 text-sm">No pending requests.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections?.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={connection.following?.avatar_url} />
                        <AvatarFallback>
                          {connection.following?.first_name?.[0]}{connection.following?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {connection.following?.first_name} {connection.following?.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{connection.following?.title}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {connection.following?.company}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {connection.following?.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )) || (
                  <p className="text-gray-500">No connections yet. Start building your network!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Network Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Connections</span>
                <Badge variant="secondary">{connections?.length || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Profile Views</span>
                <Badge variant="secondary">127</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Search Appearances</span>
                <Badge variant="secondary">45</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Industry Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Technology</span>
                <span className="text-sm text-blue-600">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Finance</span>
                <span className="text-sm text-blue-600">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Healthcare</span>
                <span className="text-sm text-blue-600">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Education</span>
                <span className="text-sm text-blue-600">15%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
