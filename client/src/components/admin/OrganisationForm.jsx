/**
 * OrganisationForm Component
 *
 * Form for creating and editing organisations
 * Handles form validation and image uploads
 * Allows selecting a user as admin when creating
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useAdmin } from '@/context/AdminContext';

// Organisation type keys for translation
const ORGANISATION_TYPE_KEYS = ['university', 'company', 'institution', 'other'];

/**
 * OrganisationForm Component
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Handler for dialog open state change
 * @param {object} organisation - Existing organisation data for editing (null for create)
 * @param {function} onSubmit - Handler for form submission
 * @param {boolean} loading - Loading state during submission
 */
export default function OrganisationForm({
  open,
  onOpenChange,
  organisation,
  onSubmit,
  loading,
}) {
  const { t } = useTranslation();

  // Get admin context for user search
  const { searchUsers, updateUserRole } = useAdmin();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'university',
    description: '',
    email: '',
    website: '',
    phone: '',
  });
  const [logo, setLogo] = useState(null);
  const [errors, setErrors] = useState({});

  // Admin selection state (for new organisations only)
  const [adminSearch, setAdminSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searching, setSearching] = useState(false);

  // Determine if editing or creating
  const isEditing = !!organisation;

  // Populate form when editing
  useEffect(() => {
    if (organisation) {
      setFormData({
        name: organisation.name || '',
        type: organisation.type || 'university',
        description: organisation.description || '',
        email: organisation.email || '',
        website: organisation.website || '',
        phone: organisation.phone || '',
      });
    } else {
      // Reset form for new organisation
      setFormData({
        name: '',
        type: 'university',
        description: '',
        email: '',
        website: '',
        phone: '',
      });
      setLogo(null);
    }
    // Reset admin selection state
    setAdminSearch('');
    setSearchResults([]);
    setSelectedAdmin(null);
    setErrors({});
  }, [organisation, open]);

  /**
   * Search users by email for admin assignment
   */
  const handleAdminSearch = useCallback(async () => {
    if (!adminSearch.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const data = await searchUsers(adminSearch);
      setSearchResults(data.data.users || []);
    } catch (err) {
      console.error('Failed to search users:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [adminSearch, searchUsers]);

  /**
   * Select a user as admin
   */
  const handleSelectAdmin = (user) => {
    setSelectedAdmin(user);
    setAdminSearch('');
    setSearchResults([]);
  };

  /**
   * Clear selected admin
   */
  const handleClearAdmin = () => {
    setSelectedAdmin(null);
  };

  /**
   * Handle input field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handle select field changes
   */
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle file input changes
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
    }
  };

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('validation.descriptionRequired');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create FormData for file upload support
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        submitData.append(key, value);
      }
    });

    if (logo) {
      submitData.append('logo', logo);
    }

    // Add selected admin to admins array if creating new organisation
    if (!isEditing && selectedAdmin) {
      submitData.append('admins', selectedAdmin._id);

      // Update user role to 'organisation' after form submission
      try {
        await updateUserRole(selectedAdmin._id, 'organisation');
      } catch (err) {
        console.error('Failed to update user role:', err);
      }
    }

    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('organisations.editOrganisation') : t('organisations.createOrganisation')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('organisations.updateOrgDescription')
              : t('organisations.createOrgDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('common.name')} *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('organisations.namePlaceholder')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Type Field */}
          <div className="space-y-2">
            <Label htmlFor="type">{t('common.type')}</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('organisations.selectType')} />
              </SelectTrigger>
              <SelectContent>
                {ORGANISATION_TYPE_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`organisations.types.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('common.description')} *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('organisations.descriptionPlaceholder')}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('common.email')} *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('organisations.emailPlaceholder')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Website Field */}
          <div className="space-y-2">
            <Label htmlFor="website">{t('common.website')}</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder={t('organisations.websitePlaceholder')}
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">{t('common.phone')}</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('organisations.phonePlaceholder')}
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">{t('organisations.logo')}</Label>
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {organisation?.logo && !logo && (
              <p className="text-sm text-muted-foreground">
                {t('organisations.currentLogoKept')}
              </p>
            )}
          </div>

          {/* Admin Selection (only for new organisations) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label>{t('organisations.assignAdminOptional')}</Label>
              {selectedAdmin ? (
                <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                  <div>
                    <p className="font-medium">{selectedAdmin.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAdmin.email}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAdmin}
                  >
                    {t('organisations.removeAdmin')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('organisations.searchUsersPlaceholder')}
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdminSearch())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAdminSearch}
                      disabled={searching}
                    >
                      {searching ? '...' : t('common.search')}
                    </Button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="border rounded-md max-h-32 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSelectAdmin(user)}
                        >
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {t('organisations.selectedUserWillBeAssigned')}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : isEditing ? t('common.update') : t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
