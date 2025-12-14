/**
 * EventFilters Component
 *
 * Provides filtering controls for events:
 * - Search by keyword
 * - Filter by category
 * - Filter by event type (online/offline/hybrid)
 * - Filter by organisation
 *
 * Filters apply instantly (client-side filtering)
 */

import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Event category keys for translation
const EVENT_CATEGORY_KEYS = [
  'all',
  'workshop',
  'seminar',
  'conference',
  'webinar',
  'hackathon',
  'careerFair',
  'networking',
  'competition',
  'cultural',
  'sports',
  'other',
];

// Event type keys for translation
const EVENT_TYPE_KEYS = ['all', 'online', 'offline', 'hybrid'];

/**
 * EventFilters Component
 * @param {Object} filters - Current filter values
 * @param {function} onFilterChange - Handler for filter changes
 * @param {function} onSearch - Handler for search action (resets pagination)
 * @param {Array} organisations - List of organisations for filter
 */
export default function EventFilters({
  filters,
  onFilterChange,
  onSearch,
  organisations = [],
}) {
  const { t } = useTranslation();

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  /**
   * Handle select change
   */
  const handleSelectChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      category: 'all',
      eventType: 'all',
      organisationId: 'all',
    });
  };

  // Map category key to actual value (handle careerFair -> career-fair)
  const getCategoryValue = (key) => {
    if (key === 'careerFair') return 'career-fair';
    return key;
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.search ||
    filters.category !== 'all' ||
    filters.eventType !== 'all' ||
    filters.organisationId !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and main filters row */}
      <div className="flex flex-wrap gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder={t('events.searchPlaceholder')}
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(value) => handleSelectChange('category', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('common.category')} />
          </SelectTrigger>
          <SelectContent>
            {EVENT_CATEGORY_KEYS.map((key) => (
              <SelectItem key={key} value={getCategoryValue(key)}>
                {t(`events.categories.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Event Type Filter */}
        <Select
          value={filters.eventType}
          onValueChange={(value) => handleSelectChange('eventType', value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('common.type')} />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPE_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {t(`events.types.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Organisation Filter */}
        {organisations.length > 0 && (
          <Select
            value={filters.organisationId}
            onValueChange={(value) => handleSelectChange('organisationId', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filters.selectOrganisation')} />
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
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearFilters}>
            {t('common.clearFilters')}
          </Button>
        )}
      </div>
    </div>
  );
}
