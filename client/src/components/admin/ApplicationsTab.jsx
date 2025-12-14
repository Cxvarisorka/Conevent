/**
 * ApplicationsTab Component
 *
 * Displays list of all event applications for admin
 * - View all applications with user and event info
 * - Filter by status and event
 * - Accept or reject pending applications
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
import { Textarea } from '@/components/ui/textarea';
import { useAdmin } from '@/context/AdminContext';

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
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || colors.pending;
};

/**
 * ApplicationsTab Component
 */
export default function ApplicationsTab() {
  const { t } = useTranslation();

  // Data state
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Filter state
  const [filterStatus, setFilterStatus] = useState('all');

  // Dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionType, setActionType] = useState(''); // 'accept' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Get admin context
  const {
    getAdminApplications,
    updateApplicationStatus,
    loading,
    error,
  } = useAdmin();

  /**
   * Fetch applications from API
   */
  const fetchApplications = useCallback(
    async (page = 1, status = 'all') => {
      try {
        const params = { page, limit: 10 };
        if (status && status !== 'all') {
          params.status = status;
        }
        const data = await getAdminApplications(params);
        setApplications(data.data.applications);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
        });
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      }
    },
    [getAdminApplications]
  );

  // Initial fetch
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  /**
   * Handle status filter change
   */
  const handleFilterChange = (value) => {
    setFilterStatus(value);
    fetchApplications(1, value);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    fetchApplications(newPage, filterStatus);
  };

  /**
   * Open action dialog
   */
  const handleActionClick = (application, action) => {
    setSelectedApplication(application);
    setActionType(action);
    setRejectionReason('');
    setActionDialogOpen(true);
  };

  /**
   * Handle action confirmation
   */
  const handleActionConfirm = async () => {
    if (!selectedApplication) return;

    setProcessing(true);
    try {
      const status = actionType === 'accept' ? 'accepted' : 'rejected';
      await updateApplicationStatus(
        selectedApplication._id,
        status,
        actionType === 'reject' ? rejectionReason : undefined
      );
      setActionDialogOpen(false);
      setSelectedApplication(null);
      fetchApplications(pagination.page, filterStatus);
      toast.success(actionType === 'accept' ? t('applications.applicationAccepted') : t('applications.applicationRejected'));
    } catch (err) {
      console.error('Failed to update application:', err);
      toast.error(err.message || t('applications.failedToUpdateApplication'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 flex-1 max-w-md">
          <Select value={filterStatus} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('applications.statuses.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('applications.statuses.all')}</SelectItem>
              <SelectItem value="pending">{t('applications.statuses.pending')}</SelectItem>
              <SelectItem value="accepted">{t('applications.statuses.accepted')}</SelectItem>
              <SelectItem value="rejected">{t('applications.statuses.rejected')}</SelectItem>
              <SelectItem value="cancelled">{t('applications.statuses.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('applications.totalApplications', { count: pagination.total })}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Applications table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('applications.user')}</TableHead>
              <TableHead>{t('applications.event')}</TableHead>
              <TableHead>{t('applications.organisation')}</TableHead>
              <TableHead>{t('common.price')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead>{t('applications.applied')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.applications ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('applications.noApplicationsFound')}
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.userId?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.userId?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{app.eventId?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(app.eventId?.startDate)}
                    </p>
                  </TableCell>
                  <TableCell>
                    {app.eventId?.organisationId?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {app.eventId?.price ? `$${app.eventId.price}` : t('common.free')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {t(`applications.statuses.${app.status}`)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(app.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {app.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleActionClick(app, 'accept')}
                        >
                          {t('applications.accept')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleActionClick(app, 'reject')}
                        >
                          {t('applications.reject')}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {app.processedBy?.name && t('applications.processedBy', { name: app.processedBy.name })}
                      </span>
                    )}
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

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' ? t('applications.acceptApplication') : t('applications.rejectApplication')}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept'
                ? t('applications.acceptConfirm', { name: selectedApplication?.userId?.name, event: selectedApplication?.eventId?.title })
                : t('applications.rejectConfirm', { name: selectedApplication?.userId?.name })}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="py-4">
              <Textarea
                placeholder={t('applications.rejectionReason')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant={actionType === 'accept' ? 'default' : 'destructive'}
              onClick={handleActionConfirm}
              disabled={processing}
            >
              {processing
                ? t('common.processing')
                : actionType === 'accept'
                ? t('applications.accept')
                : t('applications.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
