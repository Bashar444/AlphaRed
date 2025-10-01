
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    profiles: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      avatar_url: string;
      title: string;
      company: string;
    };
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .eq('interaction_type', 'like')
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_interactions')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;
        return 'unliked';
      } else {
        // Like
        const { error } = await supabase
          .from('post_interactions')
          .insert({
            user_id: user.id,
            post_id: post.id,
            interaction_type: 'like',
          });
        
        if (error) throw error;
        return 'liked';
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.profiles.avatar_url} />
              <AvatarFallback>
                {post.profiles.first_name?.[0]}{post.profiles.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {post.profiles.first_name} {post.profiles.last_name}
              </h3>
              <p className="text-sm text-gray-600">
                {post.profiles.title} at {post.profiles.company}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* naive media rendering: if content contains a public URL at the end, show it */}
        {(() => {
          const urlMatch = post.content.match(/https?:[^\s]+$/);
          if (urlMatch) {
            const mediaUrl = urlMatch[0];
            if (mediaUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
              return (
                <div className="rounded-md overflow-hidden border">
                  <video src={mediaUrl} controls className="w-full max-h-[600px]" />
                </div>
              );
            }
            if (mediaUrl.match(/\.(png|jpg|jpeg|gif|webp|avif)(\?.*)?$/i)) {
              return (
                <div className="rounded-md overflow-hidden border">
                  <img src={mediaUrl} alt="post media" className="w-full max-h-[600px] object-contain" />
                </div>
              );
            }
            // For non-media links (documents), show a simple link chip
            return (
              <a href={mediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200">
                View attachment
              </a>
            );
          }
          return null;
        })()}
        <p className="text-gray-900 whitespace-pre-wrap">
          {/* show text without the trailing media url if present */}
          {post.content.replace(/\n?https?:[^\s]+$/,'')}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
            >
              <Heart className="h-4 w-4 mr-1" />
              {post.likes_count}
            </Button>
            
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.comments_count}
            </Button>
            
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              {post.shares_count}
            </Button>
          </div>
          
          <Button variant="ghost" size="sm">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
