/**
 * MobileNavigation Component - Bottom Navigation Bar
 *
 * Features:
 * - Fixed bottom navigation for mobile
 * - Animated active states
 * - Quick access to main sections
 */

import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Building2,
  FileText,
  Home,
  User,
  Search,
  Bell,
} from 'lucide-react';

export default function MobileNavigation({ activeTab, onTabChange, hasNotifications = false }) {
  const { t } = useTranslation();

  const navItems = [
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      activeIcon: Calendar,
    },
    {
      id: 'organisations',
      label: 'Orgs',
      icon: Building2,
      activeIcon: Building2,
    },
    {
      id: 'applications',
      label: 'My Apps',
      icon: FileText,
      activeIcon: FileText,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      activeIcon: User,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 relative ${
                isActive ? 'text-violet-600' : 'text-muted-foreground'
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-b-full" />
              )}

              {/* Icon Container */}
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-violet-100 scale-110' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all ${
                    isActive ? 'text-violet-600' : ''
                  }`}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Notification Badge */}
                {item.id === 'profile' && hasNotifications && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium mt-0.5 transition-all ${
                  isActive ? 'text-violet-600' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Safe area padding for iOS */}
      <style>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </nav>
  );
}
