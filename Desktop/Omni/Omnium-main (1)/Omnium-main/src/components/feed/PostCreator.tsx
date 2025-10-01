
import React, { useMemo, useRef, useState } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const PostCreator = () => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const remaining = useMemo(() => 5000 - content.length, [content.length]);
  const isOverLimit = remaining < 0;

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

      // Optional media upload
      let contentToSave = postData.content;
      if (selectedFile) {
        const bucket = 'posts';
        const path = `${user.id}/${Date.now()}-${selectedFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, selectedFile, { upsert: false });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
        const publicUrl = publicUrlData.publicUrl;
        // Append the media URL to content so it renders even without schema changes
        contentToSave = postData.content
          ? `${postData.content}\n${publicUrl}`
          : publicUrl;
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: contentToSave,
          content_type: postData.content_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
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
    if (!content.trim() && !selectedFile) return;
    if (isOverLimit) return;
    
    createPostMutation.mutate({
      content: content.trim(),
      content_type: selectedFile ? (selectedFile.type.startsWith('video') ? 'video' : 'image') : 'text',
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
                className={`min-h-[100px] resize-none border-none focus:ring-0 text-lg ${isOverLimit ? 'text-red-600' : ''}`}
                maxLength={6000}
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{Math.max(0, remaining)} / 5000</span>
                {isOverLimit && <span className="text-red-600">Too many characters</span>}
              </div>
              {previewUrl && (
                <div className="rounded-md overflow-hidden border">
                  {selectedFile?.type.startsWith('video') ? (
                    <video src={previewUrl} controls className="w-full max-h-96" />
                  ) : (
                    <img src={previewUrl} alt="preview" className="w-full max-h-96 object-contain" />
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setSelectedFile(f);
                      setPreviewUrl(f ? URL.createObjectURL(f) : null);
                    }}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Image className="h-4 w-4 mr-2" />
                    Photo/Video
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Document
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="sm">
                        <Smile className="h-4 w-4 mr-2" />
                        Emoji
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="grid grid-cols-8 gap-2 w-[260px]">
                      {['😀','😁','😂','🤣','😊','😍','🤩','🥳','👍','🔥','💡','🎯','🙏','💼','🚀','💬','📈','📚','🧠','🤝','🌟','✅','🛠️','🎉'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          className="text-xl hover:scale-110 transition"
                          onClick={() => setContent((c) => c + em)}
                          aria-label={`emoji ${em}`}
                        >
                          {em}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={(!!isOverLimit) || (!content.trim() && !selectedFile) || createPostMutation.isPending}
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
