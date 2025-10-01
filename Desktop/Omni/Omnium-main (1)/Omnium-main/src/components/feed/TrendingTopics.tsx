
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const trendingTopics = [
  { name: 'AI & Machine Learning', posts: 1234 },
  { name: 'Remote Work', posts: 892 },
  { name: 'Startup Life', posts: 654 },
  { name: 'Web Development', posts: 543 },
  { name: 'Leadership', posts: 432 },
];

export const TrendingTopics = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingTopics.map((topic) => (
          <div key={topic.name} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{topic.name}</p>
              <p className="text-xs text-gray-500">{topic.posts} posts</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Trending
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
