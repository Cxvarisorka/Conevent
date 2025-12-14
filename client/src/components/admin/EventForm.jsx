/**
 * EventForm Component
 *
 * Form for creating and editing events
 * Handles form validation and date inputs
 */

import { useState, useEffect, useRef } from 'react';
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
import { Upload, X, ImageIcon } from 'lucide-react';

// Event category keys for translation
const EVENT_CATEGORY_KEYS = [
  'workshop', 'seminar', 'conference', 'webinar', 'hackathon',
  'career-fair', 'networking', 'competition', 'cultural', 'sports', 'other',
];

// Event type keys for translation
const EVENT_TYPE_KEYS = ['online', 'offline', 'hybrid'];

// Event status keys for translation
const EVENT_STATUS_KEYS = ['draft', 'published', 'ongoing', 'completed', 'cancelled'];

// Map category key to translation key (handle career-fair -> careerFair)
const getCategoryTranslationKey = (key) => {
  if (key === 'career-fair') return 'careerFair';
  return key;
};

/**
 * Format date for datetime-local input
 */
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
};

/**
 * EventForm Component
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Handler for dialog open state change
 * @param {object} event - Existing event data for editing (null for create)
 * @param {array} organisations - List of organisations to select from
 * @param {function} onSubmit - Handler for form submission
 * @param {boolean} loading - Loading state during submission
 */
export default function EventForm({
  open,
  onOpenChange,
  event,
  organisations,
  onSubmit,
  loading,
}) {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organisationId: '',
    category: 'workshop',
    eventType: 'offline',
    status: 'draft',
    startDate: '',
    endDate: '',
    capacity: 50,
    isFree: true,
    price: 0,
    city: '',
    address: '',
    onlineLink: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const coverInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  // Determine if editing or creating
  const isEditing = !!event;

  // Populate form when editing
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        organisationId: event.organisationId?._id || event.organisationId || '',
        category: event.category || 'workshop',
        eventType: event.eventType || 'offline',
        status: event.status || 'draft',
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        capacity: event.capacity || 50,
        isFree: event.isFree !== false,
        price: event.price || 0,
        city: event.city || '',
        address: event.address || '',
        onlineLink: event.onlineLink || '',
      });
      // Set existing images as previews
      setCoverImagePreview(event.coverImage || null);
      setAdditionalImagePreviews(event.images || []);
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        organisationId: organisations?.[0]?._id || '',
        category: 'workshop',
        eventType: 'offline',
        status: 'draft',
        startDate: '',
        endDate: '',
        capacity: 50,
        isFree: true,
        price: 0,
        city: '',
        address: '',
        onlineLink: '',
      });
      setCoverImage(null);
      setCoverImagePreview(null);
      setAdditionalImages([]);
      setAdditionalImagePreviews([]);
    }
    setErrors({});
  }, [event, open, organisations]);

  /**
   * Handle input field changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
   * Handle cover image selection
   */
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  /**
   * Handle additional images selection
   */
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - additionalImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      setAdditionalImages(prev => [...prev, ...filesToAdd]);
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
      setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  /**
   * Remove cover image
   */
  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  /**
   * Remove additional image by index
   */
  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop event for cover image
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setCoverImage(file);
        setCoverImagePreview(URL.createObjectURL(file));
      }
    }
  };

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('validation.titleRequired');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('validation.descriptionRequired');
    }
    if (!formData.organisationId) {
      newErrors.organisationId = t('validation.organisationRequired');
    }
    if (!formData.startDate) {
      newErrors.startDate = t('validation.startDateRequired');
    }
    if (!formData.endDate) {
      newErrors.endDate = t('validation.endDateRequired');
    }
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = t('validation.endDateAfterStart');
      }
    }
    if (formData.capacity < 5) {
      newErrors.capacity = t('validation.capacityMin', { min: 5 });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create FormData for file upload support
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        submitData.append(key, value);
      }
    });

    // Add cover image
    if (coverImage) {
      submitData.append('coverImage', coverImage);
    }

    // Add additional images
    additionalImages.forEach(img => {
      submitData.append('images', img);
    });

    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('events.editEvent') : t('events.createEvent')}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('events.updateEventDescription')
              : t('events.createEventDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('events.eventTitle')} *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('events.titlePlaceholder')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Organisation Field */}
          <div className="space-y-2">
            <Label htmlFor="organisationId">{t('applications.organisation')} *</Label>
            <Select
              value={formData.organisationId}
              onValueChange={(value) =>
                handleSelectChange('organisationId', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('filters.selectOrganisation')} />
              </SelectTrigger>
              <SelectContent>
                {organisations?.map((org) => (
                  <SelectItem key={org._id} value={org._id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.organisationId && (
              <p className="text-sm text-red-500">{errors.organisationId}</p>
            )}
          </div>

          {/* Category and Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t('common.category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('events.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORY_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`events.categories.${getCategoryTranslationKey(key)}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">{t('events.eventType')}</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) =>
                  handleSelectChange('eventType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('events.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`events.types.${key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('common.description')} *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('events.descriptionPlaceholder')}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('events.startDate')} *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t('events.endDate')} *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Location Fields (for offline/hybrid events) */}
          {(formData.eventType === 'offline' ||
            formData.eventType === 'hybrid') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t('events.city')}</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t('events.cityPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('events.address')}</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('events.addressPlaceholder')}
                />
              </div>
            </div>
          )}

          {/* Online Link (for online/hybrid events) */}
          {(formData.eventType === 'online' ||
            formData.eventType === 'hybrid') && (
            <div className="space-y-2">
              <Label htmlFor="onlineLink">{t('events.onlineLink')}</Label>
              <Input
                id="onlineLink"
                name="onlineLink"
                value={formData.onlineLink}
                onChange={handleChange}
                placeholder={t('events.onlineLinkPlaceholder')}
              />
            </div>
          )}

          {/* Capacity and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">{t('common.capacity')}</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="5"
                value={formData.capacity}
                onChange={handleChange}
              />
              {errors.capacity && (
                <p className="text-sm text-red-500">{errors.capacity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('common.status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('events.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_STATUS_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`events.statuses.${key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                id="isFree"
                name="isFree"
                type="checkbox"
                checked={formData.isFree}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <Label htmlFor="isFree">{t('events.freeEvent')}</Label>
            </div>

            {!formData.isFree && (
              <div className="space-y-2">
                <Label htmlFor="price">{t('events.priceUsd')}</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label>{t('events.coverImage')}</Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
            />

            {coverImagePreview ? (
              <div className="relative group">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1 bg-black/50 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {t('common.change')}
                </button>
              </div>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                  }
                `}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">{t('events.dragDropCover')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('events.orClickToSelect')}</p>
              </div>
            )}
          </div>

          {/* Additional Images Upload */}
          <div className="space-y-2">
            <Label>{t('events.additionalImages')} ({additionalImagePreviews.length}/5)</Label>
            <input
              ref={imagesInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              className="hidden"
            />

            {/* Image previews grid */}
            {additionalImagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-2">
                {additionalImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add more images button */}
            {additionalImagePreviews.length < 5 && (
              <button
                type="button"
                onClick={() => imagesInputRef.current?.click()}
                className="w-full border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors"
              >
                <ImageIcon className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{t('events.addMoreImages')}</p>
              </button>
            )}
          </div>

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
