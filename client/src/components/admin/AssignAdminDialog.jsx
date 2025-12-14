/**
 * AssignAdminDialog Component
 *
 * Dialog for managing organisation admins
 * - Search and add users as admins
 * - View and remove current admins
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdmin } from '@/context/AdminContext';

/**
 * AssignAdminDialog Component
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Handler for dialog open state change
 * @param {object} organisation - Organisation to manage admins for
 * @param {function} onAdminChange - Callback when admins are modified
 */
export default function AssignAdminDialog({
  open,
  onOpenChange,
  organisation,
  onAdminChange,
}) {
  const { t } = useTranslation();

  // State for user search
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentAdmins, setCurrentAdmins] = useState([]);
  const [error, setError] = useState('');

  // Get admin context methods
  const { searchUsers, addOrganisationAdmin, removeOrganisationAdmin } = useAdmin();

  // Update current admins when organisation changes
  useEffect(() => {
    if (organisation?.admins) {
      setCurrentAdmins(organisation.admins);
    } else {
      setCurrentAdmins([]);
    }
    setSearchEmail('');
    setSearchResults([]);
    setError('');
  }, [organisation, open]);

  /**
   * Search for users by email
   */
  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      return;
    }

    setSearching(true);
    setError('');
    try {
      const data = await searchUsers(searchEmail);
      // Filter out users who are already admins
      const adminIds = currentAdmins.map((admin) =>
        typeof admin === 'object' ? admin._id : admin
      );
      const filteredResults = data.data.users.filter(
        (user) => !adminIds.includes(user._id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      setError(t('common.noResults'));
    } finally {
      setSearching(false);
    }
  };

  /**
   * Add a user as admin
   */
  const handleAddAdmin = async (user) => {
    setError('');
    try {
      const data = await addOrganisationAdmin(organisation._id, user._id);
      setCurrentAdmins(data.data.organisation.admins);
      setSearchResults((prev) => prev.filter((u) => u._id !== user._id));
      onAdminChange?.();
      toast.success(t('organisations.adminAdded', { name: user.name }));
    } catch (err) {
      setError(err.message || t('organisations.failedToAddAdmin'));
      toast.error(err.message || t('organisations.failedToAddAdmin'));
    }
  };

  /**
   * Remove a user from admins
   */
  const handleRemoveAdmin = async (userId) => {
    setError('');
    try {
      const data = await removeOrganisationAdmin(organisation._id, userId);
      setCurrentAdmins(data.data.organisation.admins);
      onAdminChange?.();
      toast.success(t('organisations.adminRemoved'));
    } catch (err) {
      setError(err.message || t('organisations.failedToRemoveAdmin'));
      toast.error(err.message || t('organisations.failedToRemoveAdmin'));
    }
  };

  /**
   * Handle search on Enter key
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('organisations.manageAdmins')}</DialogTitle>
          <DialogDescription>
            {t('organisations.manageAdminsDescription', { name: organisation?.name })}
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Search Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('organisations.searchUsersByEmail')}</Label>
            <div className="flex gap-2">
              <Input
                placeholder={t('organisations.searchUsersPlaceholder')}
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? t('common.loading') : t('common.search')}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>{t('organisations.searchResults')}</Label>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.name')}</TableHead>
                      <TableHead>{t('common.email')}</TableHead>
                      <TableHead className="w-[100px]">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAddAdmin(user)}
                          >
                            {t('organisations.addAdmin')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Current Admins Section */}
          <div className="space-y-2">
            <Label>{t('organisations.currentAdmins')} ({currentAdmins.length})</Label>
            {currentAdmins.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('organisations.noAdminsAssigned')}
              </p>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.name')}</TableHead>
                      <TableHead>{t('common.email')}</TableHead>
                      <TableHead className="w-[100px]">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAdmins.map((admin) => {
                      // Handle both populated and non-populated admin objects
                      const adminData =
                        typeof admin === 'object'
                          ? admin
                          : { _id: admin, name: t('common.loading'), email: '' };
                      return (
                        <TableRow key={adminData._id}>
                          <TableCell>{adminData.name}</TableCell>
                          <TableCell>{adminData.email}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveAdmin(adminData._id)}
                            >
                              {t('organisations.removeAdmin')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
