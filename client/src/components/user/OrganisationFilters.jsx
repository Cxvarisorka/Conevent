/**
 * OrganisationFilters Component
 *
 * Provides filtering controls for organisations:
 * - Search by name/description
 * - Filter by organisation type
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

// Organisation type keys for translation
const ORGANISATION_TYPE_KEYS = ['all', 'university', 'company', 'institution', 'other'];

/**
 * OrganisationFilters Component
 * @param {Object} filters - Current filter values
 * @param {function} onFilterChange - Handler for filter changes
 * @param {function} onSearch - Handler for search action (resets pagination)
 */
export default function OrganisationFilters({
  filters,
  onFilterChange,
  onSearch,
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
      type: 'all',
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.type !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and filters row */}
      <div className="flex flex-wrap gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder={t('organisations.searchPlaceholder')}
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Type Filter */}
        <Select
          value={filters.type}
          onValueChange={(value) => handleSelectChange('type', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('common.type')} />
          </SelectTrigger>
          <SelectContent>
            {ORGANISATION_TYPE_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {t(`organisations.types.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
