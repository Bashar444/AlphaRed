
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Image, 
  Video, 
  FileText, 
  Link as LinkIcon,
  Smile,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const PostCreator = () => {
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return data;
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; content_type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: postData.content,
          content_type: postData.content_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Post created",
        description: "Your post has been shared successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    createPostMutation.mutate({
      content: content.trim(),
      content_type: 'text',
    });
  };

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Share an update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="What's on your mind, professional?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-none focus:ring-0 text-lg"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button type="button" variant="ghost" size="sm">
                    <Image className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Document
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!content.trim() || createPostMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
