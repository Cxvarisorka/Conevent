/**
 * OrganisationDashboard Page - Modern Social Media Style
 *
 * Dashboard for users with "organisation" role
 * Features:
 * - Modern sidebar navigation
 * - Stats overview cards
 * - Event management with cards
 * - Application management
 * - Organisation profile
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EventForm from '@/components/admin/EventForm';
import EventDetailDialog from '@/components/admin/EventDetailDialog';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  Calendar,
  Building2,
  Users,
  FileText,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  TrendingUp,
  Clock,
  MapPin,
  BarChart3,
  Loader2,
  Globe,
  Mail,
  Phone,
  Upload,
  ExternalLink,
} from 'lucide-react';

// Organisation types moved inside component to use translations

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusStyle = (status) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    published: 'bg-green-100 text-green-700 border-green-200',
    ongoing: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-purple-100 text-purple-700 border-purple-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return styles[status] || styles.draft;
};

const getAppStatusStyle = (status) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    accepted: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return styles[status] || styles.pending;
};

const getInitials = (name) => {
  if (!name) return 'O';
  return name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
};

function OrganisationDashboardContent() {
  const { t } = useTranslation();
  const { user, logout, loading: authLoading } = useAuth();
  const {
    getOrganisations,
    updateOrganisation,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getOrganisationApplications,
    updateApplicationStatus,
    loading,
    error,
  } = useAdmin();
  const navigate = useNavigate();

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Organisation state
  const [organisation, setOrganisation] = useState(null);
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    type: 'university',
    description: '',
    email: '',
    website: '',
    phone: '',
  });
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);

  // Events state
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  // Event dialogs
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [appPagination, setAppPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [appFilterStatus, setAppFilterStatus] = useState('all');
  const [appActionDialogOpen, setAppActionDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [appActionType, setAppActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingApp, setProcessingApp] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });

  // Redirect non-organisation users
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'organisation')) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Fetch organisation
  const fetchOrganisation = useCallback(async () => {
    try {
      const data = await getOrganisations({ limit: 100 });
      const userOrg = data.data.organisations.find((org) =>
        org.admins?.some((admin) => admin._id === user?._id || admin === user?._id)
      );
      if (userOrg) {
        setOrganisation(userOrg);
        setOrgFormData({
          name: userOrg.name || '',
          type: userOrg.type || 'university',
          description: userOrg.description || '',
          email: userOrg.email || '',
          website: userOrg.website || '',
          phone: userOrg.phone || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch organisation:', err);
    }
  }, [getOrganisations, user]);

  // Fetch events
  const fetchEvents = useCallback(async (page = 1, search = '') => {
    if (!organisation) return;
    try {
      const params = { page, limit: 10, organisationId: organisation._id };
      if (search) params.search = search;
      const data = await getEvents(params);
      setEvents(data.data.events);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });

      // Update stats
      const activeCount = data.data.events.filter(e => e.status === 'published' || e.status === 'ongoing').length;
      setStats(prev => ({ ...prev, totalEvents: data.total, activeEvents: activeCount }));
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }, [getEvents, organisation]);

  // Fetch applications
  const fetchApplications = useCallback(async (page = 1, status = 'all') => {
    try {
      const params = { page, limit: 10 };
      if (status && status !== 'all') params.status = status;
      const data = await getOrganisationApplications(params);
      setApplications(data.data.applications);
      setAppPagination({ page: data.page, totalPages: data.totalPages, total: data.total });

      // Update stats
      const pendingCount = data.data.applications.filter(a => a.status === 'pending').length;
      setStats(prev => ({ ...prev, totalApplications: data.total, pendingApplications: pendingCount }));
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  }, [getOrganisationApplications]);

  useEffect(() => {
    if (user) fetchOrganisation();
  }, [fetchOrganisation, user]);

  useEffect(() => {
    if (organisation) {
      fetchEvents();
      fetchApplications();
    }
  }, [organisation, fetchEvents, fetchApplications]);

  // Handlers
  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setOrgFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveOrganisation = async (e) => {
    e.preventDefault();
    if (!organisation) return;
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(orgFormData).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      if (logo) formData.append('logo', logo);
      await updateOrganisation(organisation._id, formData);
      fetchOrganisation();
      toast.success('Organisation updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update organisation');
    } finally {
      setSaving(false);
    }
  };

  const handleEventSubmit = async (formData) => {
    try {
      if (!selectedEvent) formData.append('organisationId', organisation._id);
      if (selectedEvent) {
        await updateEvent(selectedEvent._id, formData);
        toast.success('Event updated successfully');
      } else {
        await createEvent(formData);
        toast.success('Event created successfully');
      }
      setEventFormOpen(false);
      fetchEvents(pagination.page, searchQuery);
    } catch (err) {
      toast.error(err.message || 'Failed to save event');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;
    setDeleting(true);
    try {
      await deleteEvent(selectedEvent._id);
      setDeleteDialogOpen(false);
      fetchEvents(pagination.page, searchQuery);
      toast.success('Event deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleAppActionConfirm = async () => {
    if (!selectedApplication) return;
    setProcessingApp(true);
    try {
      const status = appActionType === 'accept' ? 'accepted' : 'rejected';
      await updateApplicationStatus(selectedApplication._id, status, appActionType === 'reject' ? rejectionReason : undefined);
      setAppActionDialogOpen(false);
      fetchApplications(appPagination.page, appFilterStatus);
      toast.success(`Application ${status} successfully`);
    } catch (err) {
      toast.error(err.message || 'Failed to update application');
    } finally {
      setProcessingApp(false);
    }
  };

  const handleLogout = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {}
    logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Organisation types with translations
  const ORGANISATION_TYPES = [
    { value: 'university', label: t('organisations.types.university') },
    { value: 'company', label: t('organisations.types.company') },
    { value: 'institution', label: t('organisations.types.institution') },
    { value: 'other', label: t('organisations.types.other') },
  ];

  const navItems = [
    { id: 'overview', label: t('orgDashboard.overview'), icon: BarChart3 },
    { id: 'events', label: t('tabs.events'), icon: Calendar },
    { id: 'applications', label: t('tabs.applications'), icon: FileText },
    { id: 'profile', label: t('orgDashboard.profile'), icon: Building2 },
  ];

  if (authLoading || !user) {
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
      {/* Sidebar */}
      <aside className={`hidden lg:flex flex-col h-screen bg-card border-r sticky top-0 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Conevent
              </span>
            )}
          </div>
        </div>

        {/* Organisation Info */}
        {!sidebarCollapsed && organisation && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-violet-200">
                <AvatarImage src={organisation.logo} alt={organisation.name} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                  {getInitials(organisation.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{organisation.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{organisation.type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-violet-50 text-violet-600' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                {isActive && <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-r-full" />}
                <Icon className={`w-5 h-5 ${isActive ? 'text-violet-600' : ''}`} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`border-t p-3 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'flex-col' : ''}`}>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Conevent</span>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold capitalize">{navItems.find(n => n.id === activeTab)?.label}</h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'overview' && t('orgDashboard.overviewDescription')}
                {activeTab === 'events' && t('orgDashboard.eventsDescription')}
                {activeTab === 'applications' && t('orgDashboard.applicationsDescription')}
                {activeTab === 'profile' && t('orgDashboard.profileDescription')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {stats.pendingApplications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('orgDashboard.totalEvents')}</p>
                        <p className="text-3xl font-bold">{stats.totalEvents}</p>
                      </div>
                      <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-violet-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('orgDashboard.activeEvents')}</p>
                        <p className="text-3xl font-bold text-green-600">{stats.activeEvents}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('tabs.applications')}</p>
                        <p className="text-3xl font-bold">{stats.totalApplications}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('applications.statuses.pending')}</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('orgDashboard.quickActions')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => { setSelectedEvent(null); setEventFormOpen(true); }}>
                      <Plus className="w-5 h-5" />
                      {t('orgDashboard.createNewEvent')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => setActiveTab('applications')}>
                      <FileText className="w-5 h-5" />
                      {t('orgDashboard.reviewApplications', { count: stats.pendingApplications })}
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => setActiveTab('profile')}>
                      <Settings className="w-5 h-5" />
                      {t('orgDashboard.updateProfile')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Events */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{t('orgDashboard.recentEvents')}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('events')}>
                      {t('common.view')} {t('common.all')}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {events.slice(0, 3).map((event) => (
                      <div key={event._id} className="flex items-center gap-3 py-3 border-b last:border-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img src={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100'} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(event.startDate)}</p>
                        </div>
                        <Badge className={`${getStatusStyle(event.status)} border text-xs`}>{t(`events.statuses.${event.status}`)}</Badge>
                      </div>
                    ))}
                    {events.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">{t('orgDashboard.noEventsYet')}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t('events.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchEvents(1, searchQuery)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => { setSelectedEvent(null); setEventFormOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('events.createEvent')}
                </Button>
              </div>

              {/* Events Grid */}
              {loading.events ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-1">{t('orgDashboard.noEventsYet')}</h3>
                  <p className="text-muted-foreground mb-4">{t('orgDashboard.createFirstEvent')}</p>
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => { setSelectedEvent(null); setEventFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('events.createEvent')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <Card key={event._id} className="border-0 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img src={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200'} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={`${getStatusStyle(event.status)} border text-xs`}>{t(`events.statuses.${event.status}`)}</Badge>
                            <Badge variant="outline" className="text-xs">{event.category}</Badge>
                          </div>
                          <h3 className="font-semibold mb-1 line-clamp-1">{event.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(event.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.registeredCount || 0}/{event.capacity || '∞'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8" onClick={() => { setSelectedEvent(event); setDetailDialogOpen(true); }}>
                              <Eye className="w-3 h-3 mr-1" /> {t('common.view')}
                            </Button>
                            <Button size="sm" variant="outline" className="h-8" onClick={() => { setSelectedEvent(event); setEventFormOpen(true); }}>
                              <Edit className="w-3 h-3 mr-1" /> {t('common.edit')}
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-red-600 hover:text-red-700" onClick={() => { setSelectedEvent(event); setDeleteDialogOpen(true); }}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchEvents(pagination.page - 1, searchQuery)} disabled={pagination.page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="flex items-center px-3 text-sm">{t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => fetchEvents(pagination.page + 1, searchQuery)} disabled={pagination.page === pagination.totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex flex-wrap items-center gap-4">
                <Select value={appFilterStatus} onValueChange={(v) => { setAppFilterStatus(v); fetchApplications(1, v); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('applications.statuses.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('applications.statuses.all')}</SelectItem>
                    <SelectItem value="pending">{t('applications.statuses.pending')}</SelectItem>
                    <SelectItem value="accepted">{t('applications.statuses.accepted')}</SelectItem>
                    <SelectItem value="rejected">{t('applications.statuses.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">{t('applications.totalApplications', { count: appPagination.total })}</span>
              </div>

              {/* Applications List */}
              {loading.applications ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-1">{t('applications.noApplicationsYet')}</h3>
                  <p className="text-muted-foreground">{t('orgDashboard.applicationsWillAppear')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <Card key={app._id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                              {getInitials(app.userId?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold">{app.userId?.name}</p>
                                <p className="text-sm text-muted-foreground">{app.userId?.email}</p>
                              </div>
                              <Badge className={`${getAppStatusStyle(app.status)} border`}>{t(`applications.statuses.${app.status}`)}</Badge>
                            </div>
                            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium">{app.eventId?.title}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(app.eventId?.startDate)} • {t('applications.applied')} {formatDate(app.createdAt)}</p>
                            </div>
                            {app.status === 'pending' && !app.eventId?.price && (
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setSelectedApplication(app); setAppActionType('accept'); setAppActionDialogOpen(true); }}>
                                  <Check className="w-4 h-4 mr-1" /> {t('applications.accept')}
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => { setSelectedApplication(app); setAppActionType('reject'); setRejectionReason(''); setAppActionDialogOpen(true); }}>
                                  <X className="w-4 h-4 mr-1" /> {t('applications.reject')}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {appPagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchApplications(appPagination.page - 1, appFilterStatus)} disabled={appPagination.page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="flex items-center px-3 text-sm">{t('common.page')} {appPagination.page} {t('common.of')} {appPagination.totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => fetchApplications(appPagination.page + 1, appFilterStatus)} disabled={appPagination.page === appPagination.totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && organisation && (
            <div className="max-w-2xl space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>{t('orgDashboard.organisationProfile')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveOrganisation} className="space-y-6">
                    {/* Logo */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 border-2 border-violet-200">
                        <AvatarImage src={organisation.logo} />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                          {getInitials(organisation.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="logo" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700">
                            <Upload className="w-4 h-4" />
                            {t('orgDashboard.uploadNewLogo')}
                          </div>
                        </Label>
                        <Input id="logo" type="file" accept="image/*" className="hidden" onChange={(e) => setLogo(e.target.files[0])} />
                        <p className="text-xs text-muted-foreground mt-1">{t('orgDashboard.logoFormat')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('orgDashboard.organisationName')}</Label>
                        <Input id="name" name="name" value={orgFormData.name} onChange={handleOrgChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">{t('common.type')}</Label>
                        <Select value={orgFormData.type} onValueChange={(v) => setOrgFormData((p) => ({ ...p, type: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORGANISATION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('common.email')}</Label>
                        <Input id="email" name="email" type="email" value={orgFormData.email} onChange={handleOrgChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('common.phone')}</Label>
                        <Input id="phone" name="phone" value={orgFormData.phone} onChange={handleOrgChange} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="website">{t('common.website')}</Label>
                        <Input id="website" name="website" value={orgFormData.website} onChange={handleOrgChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">{t('common.description')}</Label>
                      <Textarea id="description" name="description" value={orgFormData.description} onChange={handleOrgChange} rows={4} />
                    </div>

                    <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600" disabled={saving}>
                      {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('common.saving')}</> : t('orgDashboard.saveChanges')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${isActive ? 'text-violet-600' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-violet-100' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Dialogs */}
      <EventForm open={eventFormOpen} onOpenChange={setEventFormOpen} event={selectedEvent} organisations={organisation ? [organisation] : []} onSubmit={handleEventSubmit} loading={loading.events} />
      <EventDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} event={selectedEvent} />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('events.deleteEvent')}</DialogTitle>
            <DialogDescription>{t('events.deleteEventConfirm', { title: selectedEvent?.title })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={appActionDialogOpen} onOpenChange={setAppActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{appActionType === 'accept' ? t('applications.acceptApplication') : t('applications.rejectApplication')}</DialogTitle>
            <DialogDescription>
              {appActionType === 'accept'
                ? t('applications.acceptConfirm', { name: selectedApplication?.userId?.name, event: selectedApplication?.eventId?.title })
                : t('applications.rejectConfirm', { name: selectedApplication?.userId?.name })}
            </DialogDescription>
          </DialogHeader>
          {appActionType === 'reject' && (
            <Textarea placeholder={t('applications.rejectionReason')} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAppActionDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant={appActionType === 'accept' ? 'default' : 'destructive'} onClick={handleAppActionConfirm} disabled={processingApp}>
              {processingApp ? t('common.processing') : appActionType === 'accept' ? t('applications.accept') : t('applications.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrganisationDashboard() {
  return (
    <AdminProvider>
      <OrganisationDashboardContent />
    </AdminProvider>
  );
}
