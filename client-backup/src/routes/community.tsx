import { createBrowserRouter } from 'react-router-dom';
import { CommunityInsights } from '@/components/community/CommunityInsights';

export const communityRoutes = [
  {
    path: '/community',
    element: <CommunityInsights />,
  },
];

export const communityRouter = createBrowserRouter(communityRoutes);
