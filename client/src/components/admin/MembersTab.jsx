/**
 * MembersTab Component
 *
 * Displays list of all users/members
 * - View all users in a table
 * - Search by name or email
 * - Filter by role
 * - Change user roles (admin only)
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
 * Get role badge color
 */
const getRoleColor = (role) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    user: 'bg-blue-100 text-blue-800',
    organisation: 'bg-green-100 text-green-800',
  };
  return colors[role] || colors.user;
};

/**
 * MembersTab Component
 * Main component for viewing platform members
 */
export default function MembersTab() {
  const { t } = useTranslation();

  // Data state
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Role change dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);

  // Get admin context
  const { getUsers, updateUserRole, loading, error } = useAdmin();

  /**
   * Fetch users from API
   */
  const fetchUsers = useCallback(
    async (page = 1, search = '', role = 'all') => {
      try {
        const params = { page, limit: 10 };
        if (search) {
          params.search = search;
        }
        if (role && role !== 'all') {
          params.role = role;
        }
        const data = await getUsers(params);
        setUsers(data.data.users);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
        });
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    },
    [getUsers]
  );

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Handle search
   */
  const handleSearch = () => {
    fetchUsers(1, searchQuery, filterRole);
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
   * Handle role filter change
   */
  const handleFilterChange = (value) => {
    setFilterRole(value);
    fetchUsers(1, searchQuery, value);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    fetchUsers(newPage, searchQuery, filterRole);
  };

  /**
   * Open role change dialog
   */
  const handleRoleClick = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  /**
   * Handle role change submission
   */
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role) return;

    setUpdating(true);
    try {
      await updateUserRole(selectedUser._id, newRole);
      setRoleDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(pagination.page, searchQuery, filterRole);
      toast.success(t('members.roleUpdated'));
    } catch (err) {
      console.error('Failed to update user role:', err);
      toast.error(err.message || t('members.failedToUpdateRole'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 flex-1 max-w-xl">
          <Input
            placeholder={t('members.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="max-w-xs"
          />
          <Select value={filterRole} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('members.roles.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('members.roles.all')}</SelectItem>
              <SelectItem value="admin">{t('members.roles.admin')}</SelectItem>
              <SelectItem value="user">{t('members.roles.user')}</SelectItem>
              <SelectItem value="organisation">{t('members.roles.organisation')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleSearch}>
            {t('common.search')}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('members.totalMembers', { count: pagination.total })}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('common.email')}</TableHead>
              <TableHead>{t('common.type')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead>{t('members.joined')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.users ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t('members.noMembersFound')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {t(`members.roles.${user.role}`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <span className="text-green-600">{t('members.statusActive')}</span>
                    ) : (
                      <span className="text-red-600">{t('members.statusInactive')}</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleClick(user)}
                    >
                      {t('members.changeRole')}
                    </Button>
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

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('members.changeUserRole')}</DialogTitle>
            <DialogDescription>
              {t('members.changeRoleDescription', { name: selectedUser?.name, email: selectedUser?.email })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder={t('members.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t('members.roles.user')}</SelectItem>
                <SelectItem value="admin">{t('members.roles.admin')}</SelectItem>
                <SelectItem value="organisation">{t('members.roles.organisation')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={updating || newRole === selectedUser?.role}
            >
              {updating ? t('common.updating') : t('members.updateRole')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
