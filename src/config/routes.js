import Dashboard from '@/components/pages/Dashboard';
import Sessions from '@/components/pages/Sessions';
import Resources from '@/components/pages/Resources';
import Messages from '@/components/pages/Messages';
import Profile from '@/components/pages/Profile';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  sessions: {
    id: 'sessions',
    label: 'Sessions',
    path: '/sessions',
    icon: 'Calendar',
    component: Sessions
  },
  resources: {
    id: 'resources',
    label: 'Resources',
    path: '/resources',
    icon: 'BookOpen',
    component: Resources
  },
  messages: {
    id: 'messages',
    label: 'Messages',
    path: '/messages',
    icon: 'MessageCircle',
    component: Messages
  },
  profile: {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: 'User',
    component: Profile
  }
};

export const routeArray = Object.values(routes);
export default routes;