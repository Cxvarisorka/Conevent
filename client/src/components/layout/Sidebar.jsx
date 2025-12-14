/**
 * Sidebar Component - Modern Social Media Style
 *
 * Features:
 * - Collapsible sidebar for desktop
 * - Navigation with icons and labels
 * - User profile section
 * - Active state indicators
 */

import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Building2,
  FileText,
  Home,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bookmark,
  Search,
} from 'lucide-react';

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
};

export default function Sidebar({
  user,
  activeTab,
  onTabChange,
  onLogout,
  collapsed = false,
  onCollapsedChange,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'events',
      label: t('tabs.events'),
      icon: Calendar,
      onClick: () => onTabChange?.('events'),
    },
    {
      id: 'organisations',
      label: t('tabs.organisations'),
      icon: Building2,
      onClick: () => onTabChange?.('organisations'),
    },
    {
      id: 'applications',
      label: t('tabs.myApplications'),
      icon: FileText,
      onClick: () => onTabChange?.('applications'),
    },
  ];

  const secondaryItems = [
    {
      id: 'saved',
      label: 'Saved',
      icon: Bookmark,
      onClick: () => {},
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: 3,
      onClick: () => {},
    },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen bg-card border-r sticky top-0 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Conevent
            </span>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onCollapsedChange?.(!collapsed)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Expand Button when Collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onCollapsedChange?.(!collapsed)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Search (when not collapsed) */}
      {!collapsed && (
        <div className="px-4 py-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/50 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm">
            <Search className="w-4 h-4" />
            <span>Search events...</span>
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-violet-50 text-violet-600'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-r-full" />
              )}

              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-violet-600' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              />
              {!collapsed && (
                <span className={`font-medium ${isActive ? 'text-violet-600' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        <Separator className="my-4" />

        {secondaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground ${
                collapsed ? 'justify-center' : ''
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="relative">
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Upgrade Banner (when not collapsed) */}
      {!collapsed && (
        <div className="mx-3 mb-4">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold text-sm">Go Premium</span>
            </div>
            <p className="text-xs text-white/80 mb-3">
              Get unlimited event applications and exclusive features
            </p>
            <Button
              size="sm"
              className="w-full bg-white text-violet-600 hover:bg-white/90 font-semibold"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* User Profile Section */}
      <div className={`border-t p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {user && (
          <div
            className={`flex items-center gap-3 ${
              collapsed ? 'flex-col' : ''
            }`}
          >
            <Avatar className="h-10 w-10 border-2 border-violet-200">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={onLogout}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
