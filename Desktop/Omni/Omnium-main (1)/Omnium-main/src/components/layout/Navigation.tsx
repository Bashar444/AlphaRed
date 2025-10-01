
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  Home, 
  Users, 
  BookOpen,
  LogOut,
  Settings,
  Briefcase,
  Building,
  Calendar,
  TrendingUp,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export const Navigation = () => {
  const router = useRouter();
  const { toast } = useToast();

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Omnium
            </span>
          </Link>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search people, companies, jobs, courses..."
              className="pl-10 w-96 focus:w-[28rem] transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex flex-col items-center px-3 py-2 h-auto">
              <Home className="h-5 w-5" />
              <span className="text-xs">Feed</span>
            </Button>
          </Link>
          
          <Link href="/network">
            <Button variant="ghost" size="sm" className="flex flex-col items-center px-3 py-2 h-auto">
              <Users className="h-5 w-5" />
              <span className="text-xs">Network</span>
            </Button>
          </Link>
          
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className="flex flex-col items-center px-3 py-2 h-auto">
              <Briefcase className="h-5 w-5" />
              <span className="text-xs">Jobs</span>
            </Button>
          </Link>
          
          <Link href="/learning">
            <Button variant="ghost" size="sm" className="flex flex-col items-center px-3 py-2 h-auto">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Learning</span>
            </Button>
          </Link>
          
          <Link href="/companies">
            <Button variant="ghost" size="sm" className="flex flex-col items-center px-3 py-2 h-auto">
              <Building className="h-5 w-5" />
              <span className="text-xs">Companies</span>
            </Button>
          </Link>
          
          <Button variant="ghost" size="sm" className="flex flex-col items-center px-3 py-2 h-auto">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Messages</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex flex-col items-center px-3 py-2 h-auto relative">
            <Bell className="h-5 w-5" />
            <span className="text-xs">Notifications</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-8 w-8 border-2 border-gray-200 hover:border-blue-500 transition-colors">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push('/profile')} className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/analytics')} className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
