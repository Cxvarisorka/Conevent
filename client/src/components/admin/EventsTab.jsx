/**
 * EventsTab Component
 *
 * Displays list of events with CRUD operations
 * - View all events in a table
 * - Filter by organisation
 * - Create new events
 * - Edit existing events
 * - Delete events
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdmin } from '@/context/AdminContext';
import EventForm from './EventForm';
import EventDetailDialog from './EventDetailDialog';

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get status badge color
 */
const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || colors.draft;
};

/**
 * EventsTab Component
 * Main component for event management
 */
export default function EventsTab() {
  const { t } = useTranslation();

  // Data state
  const [events, setEvents] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrg, setFilterOrg] = useState('all');

  // UI state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Get admin context
  const {
    getEvents,
    getOrganisations,
    createEvent,
    updateEvent,
    deleteEvent,
    loading,
    error,
  } = useAdmin();

  /**
   * Fetch organisations for filter dropdown
   */
  const fetchOrganisations = useCallback(async () => {
    try {
      const data = await getOrganisations({ limit: 100 });
      setOrganisations(data.data.organisations);
    } catch (err) {
      console.error('Failed to fetch organisations:', err);
    }
  }, [getOrganisations]);

  /**
   * Fetch events from API
   */
  const fetchEvents = useCallback(
    async (page = 1, search = '', orgId = 'all') => {
      try {
        const params = { page, limit: 10 };
        if (search) {
          params.search = search;
        }
        if (orgId && orgId !== 'all') {
          params.organisationId = orgId;
        }
        const data = await getEvents(params);
        setEvents(data.data.events);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
        });
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    },
    [getEvents]
  );

  // Initial fetch
  useEffect(() => {
    fetchOrganisations();
    fetchEvents();
  }, [fetchOrganisations, fetchEvents]);

  /**
   * Handle search
   */
  const handleSearch = () => {
    fetchEvents(1, searchQuery, filterOrg);
  };

  /**
   * Handle search on Enter key
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * Handle organisation filter change
   */
  const handleFilterChange = (value) => {
    setFilterOrg(value);
    fetchEvents(1, searchQuery, value);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    fetchEvents(newPage, searchQuery, filterOrg);
  };

  /**
   * Open form for creating new event
   */
  const handleCreate = () => {
    setSelectedEvent(null);
    setFormOpen(true);
  };

  /**
   * Open detail dialog to view event
   */
  const handleView = (event) => {
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  /**
   * Open form for editing event
   */
  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormOpen(true);
  };

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  /**
   * Handle form submission (create or update)
   */
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent._id, formData);
        toast.success(t('events.eventUpdated'));
      } else {
        await createEvent(formData);
        toast.success(t('events.eventCreated'));
      }
      setFormOpen(false);
      fetchEvents(pagination.page, searchQuery, filterOrg);
    } catch (err) {
      console.error('Failed to save event:', err);
      toast.error(err.message || t('events.failedToSaveEvent'));
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;

    setDeleting(true);
    try {
      await deleteEvent(selectedEvent._id);
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
      fetchEvents(pagination.page, searchQuery, filterOrg);
      toast.success(t('events.eventDeleted'));
    } catch (err) {
      console.error('Failed to delete event:', err);
      toast.error(err.message || t('events.failedToDeleteEvent'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search, filter, and create button */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2 flex-1 max-w-xl">
          <Input
            placeholder={t('events.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="max-w-xs"
          />
          <Select value={filterOrg} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filters.allOrganisations')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allOrganisations')}</SelectItem>
              {organisations.map((org) => (
                <SelectItem key={org._id} value={org._id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleSearch}>
            {t('common.search')}
          </Button>
        </div>
        <Button onClick={handleCreate}>{t('events.createEvent')}</Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Events table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('events.eventTitle')}</TableHead>
              <TableHead>{t('applications.organisation')}</TableHead>
              <TableHead>{t('common.category')}</TableHead>
              <TableHead>{t('common.date')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.events ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t('events.noEventsFound')}
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    {event.organisationId?.name || t('common.unknown')}
                  </TableCell>
                  <TableCell className="capitalize">{t(`events.categories.${event.category}`)}</TableCell>
                  <TableCell>{formatDate(event.startDate)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {t(`events.statuses.${event.status}`)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(event)}
                      >
                        {t('common.view')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(event)}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(event)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            {t('common.previous')}
          </Button>
          <span className="flex items-center px-3 text-sm">
            {t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            {t('common.next')}
          </Button>
        </div>
      )}

      {/* Event Form Dialog */}
      <EventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        event={selectedEvent}
        organisations={organisations}
        onSubmit={handleFormSubmit}
        loading={loading.events}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('events.deleteEvent')}</DialogTitle>
            <DialogDescription>
              {t('events.deleteEventConfirm', { title: selectedEvent?.title })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <EventDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        event={selectedEvent}
      />
    </div>
  );
}
