import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  BookOpen,
  MessageCircle,
  Calendar,
  Briefcase,
  TrendingUp,
  Settings,
  UserPlus,
  Building,
  Star,
  Award,
  FileText,
  Video,
  Newspaper,
  ShoppingBag,
  Coffee,
  Zap,
  Target,
  DollarSign,
  BarChart3,
  Globe,
  Lightbulb,
  Users2,
  Headphones,
  Bell
} from 'lucide-react';

const sidebarSections = [
  {
    title: "Main",
    items: [
      { icon: Home, label: 'Feed', href: '/', badge: null },
      { icon: Users, label: 'My Network', href: '/network', badge: '12' },
      { icon: MessageCircle, label: 'Messages', href: '/messages', badge: '3' },
      { icon: Bell, label: 'Notifications', href: '/notifications', badge: '7' },
    ]
  },
  {
    title: "Professional",
    items: [
      { icon: Briefcase, label: 'Jobs', href: '/jobs', badge: 'Hot' },
      { icon: Building, label: 'Companies', href: '/companies', badge: null },
      { icon: Award, label: 'Skills Assessment', href: '/skills', badge: null },
      { icon: FileText, label: 'Resume Builder', href: '/resume', badge: null },
      { icon: Target, label: 'Career Goals', href: '/career', badge: null },
    ]
  },
  {
    title: "Learning & Growth",
    items: [
      { icon: BookOpen, label: 'Courses', href: '/learning', badge: null },
      { icon: Video, label: 'Webinars', href: '/webinars', badge: 'Live' },
      { icon: Lightbulb, label: 'Mentorship', href: '/mentorship', badge: null },
      { icon: Users2, label: 'Study Groups', href: '/study-groups', badge: null },
      { icon: Star, label: 'Certifications', href: '/certifications', badge: null },
    ]
  },
  {
    title: "Business & Finance",
    items: [
      { icon: DollarSign, label: 'Freelance Market', href: '/freelance', badge: null },
      { icon: ShoppingBag, label: 'Marketplace', href: '/marketplace', badge: null },
      { icon: BarChart3, label: 'Business Analytics', href: '/business-analytics', badge: null },
      { icon: Zap, label: 'Startup Hub', href: '/startups', badge: null },
    ]
  },
  {
    title: "Community",
    items: [
      { icon: Calendar, label: 'Events', href: '/events', badge: null },
      { icon: UserPlus, label: 'Groups', href: '/groups', badge: null },
      { icon: Coffee, label: 'Networking Events', href: '/networking-events', badge: null },
      { icon: Newspaper, label: 'Industry News', href: '/news', badge: null },
      { icon: Headphones, label: 'Podcasts', href: '/podcasts', badge: null },
    ]
  },
  {
    title: "Tools & Settings",
    items: [
      { icon: TrendingUp, label: 'Analytics', href: '/analytics', badge: null },
      { icon: Globe, label: 'Global Insights', href: '/insights', badge: null },
      { icon: Settings, label: 'Settings', href: '/settings', badge: null },
    ]
  }
];

export const Sidebar = () => {
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {sidebarSections.map((section, sectionIndex) => (
          <div key={section.title} className={cn("mb-6", sectionIndex > 0 && "border-t border-gray-100 pt-4")}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700")} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        item.badge === 'Hot' ? "bg-red-100 text-red-700" :
                        item.badge === 'Live' ? "bg-green-100 text-green-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
};
