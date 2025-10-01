
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus } from 'lucide-react';

const suggestedPeople = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Product Manager at Google',
    avatar: '',
    mutualConnections: 12,
  },
  {
    id: '2',
    name: 'Mike Chen',
    title: 'Software Engineer at Meta',
    avatar: '',
    mutualConnections: 8,
  },
  {
    id: '3',
    name: 'Emily Davis',
    title: 'UX Designer at Apple',
    avatar: '',
    mutualConnections: 15,
  },
];

export const SuggestedConnections = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">People You May Know</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedPeople.map((person) => (
          <div key={person.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={person.avatar} />
                <AvatarFallback>
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{person.name}</p>
                <p className="text-xs text-gray-500">{person.title}</p>
                <p className="text-xs text-gray-400">
                  {person.mutualConnections} mutual connections
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <UserPlus className="h-3 w-3 mr-1" />
              Connect
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
