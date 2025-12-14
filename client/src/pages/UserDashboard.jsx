/**
 * UserDashboard Page - Modern Social Media Style
 *
 * Features:
 * - Sidebar navigation (desktop)
 * - Bottom navigation (mobile)
 * - Stories-like featured events
 * - Social media feed layout
 * - Responsive design
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { UserProvider, useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EventCard from '@/components/user/EventCard';
import OrganisationCard from '@/components/user/OrganisationCard';
import FeaturedEvents from '@/components/user/FeaturedEvents';
import EventFilters from '@/components/user/EventFilters';
import OrganisationFilters from '@/components/user/OrganisationFilters';
import OrganisationDetailDialog from '@/components/user/OrganisationDetailDialog';
import EventDetailDialog from '@/components/user/EventDetailDialog';
import Sidebar from '@/components/layout/Sidebar';
import MobileNavigation from '@/components/layout/MobileNavigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  Calendar,
  Search,
  Bell,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Clock,
  Loader2,
  TrendingUp,
} from 'lucide-react';

const EVENTS_PER_PAGE = 12;
const ORGS_PER_PAGE = 8;

const getApplicationStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    accepted: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
    cancelled: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return colors[status] || colors.pending;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
};

function UserDashboardContent() {
  const { t } = useTranslation();
  const { user, logout, loading: authLoading } = useAuth();
  const {
    getEvents,
    getOrganisations,
    createApplication,
    getMyApplications,
    cancelApplication,
    loading,
    error,
  } = useUser();
  const navigate = useNavigate();

  // UI State
  const [activeTab, setActiveTab] = useState('events');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Data State
  const [allEvents, setAllEvents] = useState([]);
  const [allOrganisations, setAllOrganisations] = useState([]);

  // Pagination
  const [eventsPage, setEventsPage] = useState(1);
  const [orgsPage, setOrgsPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    eventType: 'all',
    organisationId: 'all',
  });
  const [orgFilters, setOrgFilters] = useState({
    search: '',
    type: 'all',
  });

  // Dialogs
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // Applications
  const [applications, setApplications] = useState([]);
  const [appPagination, setAppPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [cancellingAppId, setCancellingAppId] = useState(null);

  // Fetch functions
  const fetchEvents = useCallback(async () => {
    try {
      const data = await getEvents({ limit: 1000 });
      setAllEvents(data.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }, [getEvents]);

  const fetchOrganisations = useCallback(async () => {
    try {
      const data = await getOrganisations({ limit: 1000 });
      setAllOrganisations(data.data.organisations || []);
    } catch (err) {
      console.error('Failed to fetch organisations:', err);
    }
  }, [getOrganisations]);

  const fetchApplications = useCallback(async (page = 1) => {
    try {
      const data = await getMyApplications({ page, limit: 10 });
      setApplications(data.data.applications);
      setAppPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  }, [getMyApplications]);

  useEffect(() => {
    fetchEvents();
    fetchOrganisations();
    fetchApplications();
  }, []);

  // Filtered & Paginated Data
  const filteredEvents = useMemo(() => {
    let result = [...allEvents];

    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      result = result.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category !== 'all') {
      result = result.filter((event) => event.category === filters.category);
    }

    if (filters.eventType !== 'all') {
      result = result.filter((event) => event.eventType === filters.eventType);
    }

    if (filters.organisationId !== 'all') {
      result = result.filter(
        (event) =>
          event.organisationId?._id === filters.organisationId ||
          event.organisationId === filters.organisationId
      );
    }

    return result;
  }, [allEvents, filters]);

  const paginatedEvents = useMemo(() => {
    const startIndex = (eventsPage - 1) * EVENTS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);
  }, [filteredEvents, eventsPage]);

  const eventsPagination = useMemo(() => ({
    page: eventsPage,
    totalPages: Math.ceil(filteredEvents.length / EVENTS_PER_PAGE) || 1,
    total: filteredEvents.length,
  }), [filteredEvents.length, eventsPage]);

  const filteredOrganisations = useMemo(() => {
    let result = [...allOrganisations];

    if (orgFilters.search.trim()) {
      const searchLower = orgFilters.search.toLowerCase().trim();
      result = result.filter(
        (org) =>
          org.name?.toLowerCase().includes(searchLower) ||
          org.description?.toLowerCase().includes(searchLower)
      );
    }

    if (orgFilters.type !== 'all') {
      result = result.filter((org) => org.type === orgFilters.type);
    }

    return result;
  }, [allOrganisations, orgFilters]);

  const paginatedOrganisations = useMemo(() => {
    const startIndex = (orgsPage - 1) * ORGS_PER_PAGE;
    return filteredOrganisations.slice(startIndex, startIndex + ORGS_PER_PAGE);
  }, [filteredOrganisations, orgsPage]);

  const orgsPagination = useMemo(() => ({
    page: orgsPage,
    totalPages: Math.ceil(filteredOrganisations.length / ORGS_PER_PAGE) || 1,
    total: filteredOrganisations.length,
  }), [filteredOrganisations.length, orgsPage]);

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setEventsPage(1);
  };

  const handleSearch = () => setEventsPage(1);

  const handleOrgFilterChange = (newFilters) => {
    setOrgFilters(newFilters);
    setOrgsPage(1);
  };

  const handleOrgSearch = () => setOrgsPage(1);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleParticipate = async (event) => {
    try {
      await createApplication(event._id);
      setEventDialogOpen(false);
      fetchApplications();
      toast.success(t('events.applicationSubmitted', { title: event.title }));
    } catch (err) {
      toast.error(err.message || t('events.failedToApply'));
    }
  };

  const handleCancelApplication = async (applicationId) => {
    if (!confirm(t('applications.cancelConfirm'))) return;

    setCancellingAppId(applicationId);
    try {
      await cancelApplication(applicationId);
      fetchApplications(appPagination.page);
      toast.success(t('applications.applicationCancelled'));
    } catch (err) {
      toast.error(err.message || t('applications.failedToCancelApplication'));
    } finally {
      setCancellingAppId(null);
    }
  };

  const handleOrgClick = (org) => {
    setSelectedOrg(org);
    setOrgDialogOpen(true);
  };

  const handleLogout = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {}
    logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Conevent
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Button variant="ghost" size="icon-sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Avatar className="h-8 w-8 border-2 border-violet-200">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b">
          <div className="flex items-center justify-between px-6 h-16">
            <div>
              <h1 className="text-xl font-bold">
                {activeTab === 'events' && t('events.title')}
                {activeTab === 'organisations' && t('organisations.title')}
                {activeTab === 'applications' && t('applications.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'events' && t('events.subtitle')}
                {activeTab === 'organisations' && t('organisations.subtitle')}
                {activeTab === 'applications' && t('applications.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-4 lg:px-6 py-4 lg:py-6 max-w-7xl mx-auto">
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Featured Events Stories */}
              <FeaturedEvents
                events={allEvents}
                onEventClick={handleEventClick}
              />

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                    className="pl-10 h-11 bg-muted/50 border-0 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <Button
                  variant="outline"
                  className="h-11 gap-2 lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </Button>
                <div className="hidden lg:flex items-center gap-2">
                  <EventFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                    organisations={allOrganisations}
                    compact
                  />
                </div>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden">
                  <EventFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                    organisations={allOrganisations}
                  />
                </div>
              )}

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{paginatedEvents.length}</span> of{' '}
                  <span className="font-semibold text-foreground">{filteredEvents.length}</span> events
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">
                    {allEvents.filter(e => new Date(e.startDate) >= new Date()).length} upcoming
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}

              {/* Events Grid */}
              {loading.events ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
              ) : paginatedEvents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{t('events.noEventsFound')}</h3>
                  <p className="text-muted-foreground">{t('events.tryAdjustingFilters')}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedEvents.map((event) => (
                      <EventCard
                        key={event._id}
                        event={event}
                        onClick={handleEventClick}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {eventsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEventsPage(eventsPage - 1)}
                        disabled={eventsPage === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('common.previous')}</span>
                      </Button>
                      <div className="flex items-center gap-1 px-3">
                        {Array.from({ length: Math.min(5, eventsPagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={eventsPage === pageNum ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setEventsPage(pageNum)}
                              className={`w-8 h-8 p-0 ${
                                eventsPage === pageNum
                                  ? 'bg-gradient-to-r from-violet-600 to-purple-600'
                                  : ''
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEventsPage(eventsPage + 1)}
                        disabled={eventsPage === eventsPagination.totalPages}
                        className="gap-1"
                      >
                        <span className="hidden sm:inline">{t('common.next')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Organisations Tab */}
          {activeTab === 'organisations' && (
            <div className="space-y-6">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search organizations..."
                    value={orgFilters.search}
                    onChange={(e) => handleOrgFilterChange({ ...orgFilters, search: e.target.value })}
                    className="pl-10 h-11 bg-muted/50 border-0 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <OrganisationFilters
                  filters={orgFilters}
                  onFilterChange={handleOrgFilterChange}
                  onSearch={handleOrgSearch}
                  compact
                />
              </div>

              {/* Results Count */}
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{paginatedOrganisations.length}</span> of{' '}
                <span className="font-semibold text-foreground">{filteredOrganisations.length}</span> organizations
              </p>

              {/* Organisations Grid */}
              {loading.organisations ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
              ) : paginatedOrganisations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{t('organisations.noOrganisationsFound')}</h3>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedOrganisations.map((org) => (
                      <OrganisationCard
                        key={org._id}
                        organisation={org}
                        onClick={handleOrgClick}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {orgsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrgsPage(orgsPage - 1)}
                        disabled={orgsPage === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('common.previous')}</span>
                      </Button>
                      <span className="text-sm px-3">
                        {t('common.page')} {orgsPage} {t('common.of')} {orgsPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrgsPage(orgsPage + 1)}
                        disabled={orgsPage === orgsPagination.totalPages}
                        className="gap-1"
                      >
                        <span className="hidden sm:inline">{t('common.next')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              {loading.applications ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{t('applications.noApplicationsYet')}</h3>
                  <p className="text-muted-foreground mb-4">{t('applications.browseEventsToApply')}</p>
                  <Button
                    onClick={() => setActiveTab('events')}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  >
                    Browse Events
                  </Button>
                </div>
              ) : (
                <>
                  {/* Applications List - Card Style for Mobile */}
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app._id}
                        className="bg-card rounded-xl border p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {/* Event Image */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={app.eventId?.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200'}
                              alt={app.eventId?.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-sm sm:text-base truncate">
                                  {app.eventId?.title || 'Unknown Event'}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {app.eventId?.organisationId?.name || '-'}
                                </p>
                              </div>
                              <Badge className={`${getApplicationStatusColor(app.status)} border flex-shrink-0`}>
                                {t(`applications.statuses.${app.status}`)}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(app.eventId?.startDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Applied {formatDate(app.createdAt)}
                              </span>
                            </div>

                            {app.status === 'rejected' && app.rejectionReason && (
                              <p className="text-xs text-red-600 mt-2 bg-red-50 px-2 py-1 rounded">
                                Reason: {app.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {app.status === 'pending' && (
                          <div className="mt-3 pt-3 border-t flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancelApplication(app._id)}
                              disabled={cancellingAppId === app._id}
                            >
                              {cancellingAppId === app._id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                              ) : null}
                              {cancellingAppId === app._id ? t('common.cancelling') : t('common.cancel')}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {appPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchApplications(appPagination.page - 1)}
                        disabled={appPagination.page === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('common.previous')}</span>
                      </Button>
                      <span className="text-sm px-3">
                        {t('common.page')} {appPagination.page} {t('common.of')} {appPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchApplications(appPagination.page + 1)}
                        disabled={appPagination.page === appPagination.totalPages}
                        className="gap-1"
                      >
                        <span className="hidden sm:inline">{t('common.next')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasNotifications
      />

      {/* Dialogs */}
      <OrganisationDetailDialog
        open={orgDialogOpen}
        onOpenChange={setOrgDialogOpen}
        organisation={selectedOrg}
      />

      <EventDetailDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        event={selectedEvent}
        onParticipate={handleParticipate}
      />
    </div>
  );
}

export default function UserDashboard() {
  return (
    <UserProvider>
      <UserDashboardContent />
    </UserProvider>
  );
}
