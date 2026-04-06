import React from 'react';
import PlaceholderPage from '../PlaceholderPage';
import { Users } from 'lucide-react';

const CommunityPrograms = () => {
  return (
    <PlaceholderPage 
      title="Community & Non-Profit Partnerships" 
      icon={<Users size={48} />}
      description="Supporting public health initiatives with subsidized testing and high-impact diagnostic outreach programs."
    />
  );
};

export default CommunityPrograms;
