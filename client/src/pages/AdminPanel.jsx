/**
 * AdminPanel Page
 *
 * Main admin dashboard with tab-based navigation
 * Provides access to:
 * - Organisations management
 * - Events management
 * - Members overview
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { AdminProvider } from '@/context/AdminContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import OrganisationsTab from '@/components/admin/OrganisationsTab';
import EventsTab from '@/components/admin/EventsTab';
import MembersTab from '@/components/admin/MembersTab';
import ApplicationsTab from '@/components/admin/ApplicationsTab';
import LanguageSwitcher from '@/components/LanguageSwitcher';

/**
 * AdminPanelContent Component
 * Inner component wrapped with AdminProvider
 */
function AdminPanelContent() {
  const { t } = useTranslation();
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      // Continue with local logout even if server call fails
    }
    logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Show loading while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('common.welcome')}, {user.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="outline" onClick={handleLogout}>
              {t('common.signOut')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="organisations" className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="organisations">{t('tabs.organisations')}</TabsTrigger>
            <TabsTrigger value="events">{t('tabs.events')}</TabsTrigger>
            <TabsTrigger value="applications">{t('tabs.applications')}</TabsTrigger>
            <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
          </TabsList>

          {/* Organisations Tab Content */}
          <TabsContent value="organisations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{t('organisations.title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('admin.organisationsDescription')}
                </p>
              </div>
            </div>
            <OrganisationsTab />
          </TabsContent>

          {/* Events Tab Content */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{t('tabs.events')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('admin.eventsDescription')}
                </p>
              </div>
            </div>
            <EventsTab />
          </TabsContent>

          {/* Applications Tab Content */}
          <TabsContent value="applications" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{t('tabs.applications')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('admin.applicationsDescription')}
                </p>
              </div>
            </div>
            <ApplicationsTab />
          </TabsContent>

          {/* Members Tab Content */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{t('members.title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('admin.membersDescription')}
                </p>
              </div>
            </div>
            <MembersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/**
 * AdminPanel Page Component
 * Wraps content with AdminProvider for context access
 */
export default function AdminPanel() {
  return (
    <AdminProvider>
      <AdminPanelContent />
    </AdminProvider>
  );
}
