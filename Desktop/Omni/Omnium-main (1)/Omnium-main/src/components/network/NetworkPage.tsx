
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const NetworkPage = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Network</h1>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Import Contacts
        </Button>
      </div>

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
                        <Button size="sm">
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
