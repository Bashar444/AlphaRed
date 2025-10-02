
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SuggestedConnections = () => {
  const { toast } = useToast();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data: suggestions } = useQuery({
    queryKey: ['suggested-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', me?.id || '')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!me,
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
    onSuccess: () => toast({ title: 'Request sent', description: 'Connection request sent.' }),
    onError: () => toast({ title: 'Failed', description: 'Could not send request.', variant: 'destructive' }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">People You May Know</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions?.map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={p.avatar_url} />
                <AvatarFallback>
                  {p.first_name?.[0]}{p.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{p.first_name} {p.last_name}</p>
                <p className="text-xs text-gray-500">{p.title}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => connectMutation.mutate(p.id)}>
              <UserPlus className="h-3 w-3 mr-1" />
              Connect
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
