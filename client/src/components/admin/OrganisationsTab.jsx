/**
 * OrganisationsTab Component
 *
 * Displays list of organisations with CRUD operations
 * - View all organisations in a table
 * - Create new organisations
 * - Edit existing organisations
 * - Delete organisations
 * - Manage organisation admins
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import OrganisationForm from './OrganisationForm';
import AssignAdminDialog from './AssignAdminDialog';
import OrganisationDetailDialog from './OrganisationDetailDialog';

/**
 * OrganisationsTab Component
 * Main component for organisation management
 */
export default function OrganisationsTab() {
  const { t } = useTranslation();

  // Data state
  const [organisations, setOrganisations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Get admin context
  const {
    getOrganisations,
    createOrganisation,
    updateOrganisation,
    deleteOrganisation,
    loading,
    error,
  } = useAdmin();

  /**
   * Fetch organisations from API
   */
  const fetchOrganisations = useCallback(async (page = 1, search = '') => {
    try {
      const params = { page, limit: 10 };
      if (search) {
        params.search = search;
      }
      const data = await getOrganisations(params);
      setOrganisations(data.data.organisations);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (err) {
      console.error('Failed to fetch organisations:', err);
    }
  }, [getOrganisations]);

  // Initial fetch
  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  /**
   * Handle search
   */
  const handleSearch = () => {
    fetchOrganisations(1, searchQuery);
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
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    fetchOrganisations(newPage, searchQuery);
  };

  /**
   * Open form for creating new organisation
   */
  const handleCreate = () => {
    setSelectedOrg(null);
    setFormOpen(true);
  };

  /**
   * Open detail dialog to view organisation
   */
  const handleView = (org) => {
    setSelectedOrg(org);
    setDetailDialogOpen(true);
  };

  /**
   * Open form for editing organisation
   */
  const handleEdit = (org) => {
    setSelectedOrg(org);
    setFormOpen(true);
  };

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteClick = (org) => {
    setSelectedOrg(org);
    setDeleteDialogOpen(true);
  };

  /**
   * Open admin management dialog
   */
  const handleManageAdmins = (org) => {
    setSelectedOrg(org);
    setAdminDialogOpen(true);
  };

  /**
   * Handle form submission (create or update)
   */
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedOrg) {
        await updateOrganisation(selectedOrg._id, formData);
        toast.success(t('organisations.organisationUpdated'));
      } else {
        await createOrganisation(formData);
        toast.success(t('organisations.organisationCreated'));
      }
      setFormOpen(false);
      fetchOrganisations(pagination.page, searchQuery);
    } catch (err) {
      console.error('Failed to save organisation:', err);
      toast.error(err.message || t('organisations.failedToSaveOrg'));
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!selectedOrg) return;

    setDeleting(true);
    try {
      await deleteOrganisation(selectedOrg._id);
      setDeleteDialogOpen(false);
      setSelectedOrg(null);
      fetchOrganisations(pagination.page, searchQuery);
      toast.success(t('organisations.organisationDeleted'));
    } catch (err) {
      console.error('Failed to delete organisation:', err);
      toast.error(err.message || t('organisations.failedToDeleteOrg'));
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handle admin change callback
   */
  const handleAdminChange = () => {
    fetchOrganisations(pagination.page, searchQuery);
  };

  return (
    <div className="space-y-4">
      {/* Header with search and create button */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder={t('organisations.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button variant="outline" onClick={handleSearch}>
            {t('common.search')}
          </Button>
        </div>
        <Button onClick={handleCreate}>{t('organisations.createOrganisation')}</Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Organisations table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('common.type')}</TableHead>
              <TableHead>{t('common.email')}</TableHead>
              <TableHead>{t('organisations.admins')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.organisations ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : organisations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t('organisations.noOrganisationsFound')}
                </TableCell>
              </TableRow>
            ) : (
              organisations.map((org) => (
                <TableRow key={org._id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="capitalize">{t(`organisations.types.${org.type}`)}</TableCell>
                  <TableCell>{org.email}</TableCell>
                  <TableCell>{org.admins?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(org)}
                      >
                        {t('common.view')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageAdmins(org)}
                      >
                        {t('organisations.admins')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(org)}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(org)}
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

      {/* Organisation Form Dialog */}
      <OrganisationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        organisation={selectedOrg}
        onSubmit={handleFormSubmit}
        loading={loading.organisations}
      />

      {/* Assign Admin Dialog */}
      <AssignAdminDialog
        open={adminDialogOpen}
        onOpenChange={setAdminDialogOpen}
        organisation={selectedOrg}
        onAdminChange={handleAdminChange}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('organisations.deleteOrganisation')}</DialogTitle>
            <DialogDescription>
              {t('organisations.deleteOrgConfirm', { name: selectedOrg?.name })}
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

      {/* Organisation Detail Dialog */}
      <OrganisationDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        organisation={selectedOrg}
      />
    </div>
  );
}
