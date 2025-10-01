
import React from 'react';
import { PostCreator } from './PostCreator';
import { PostFeed } from './PostFeed';
import { TrendingTopics } from './TrendingTopics';
import { SuggestedConnections } from './SuggestedConnections';

export const FeedPage = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <PostCreator />
        <PostFeed />
      </div>
      
      <div className="space-y-6">
        <TrendingTopics />
        <SuggestedConnections />
      </div>
    </div>
  );
};
