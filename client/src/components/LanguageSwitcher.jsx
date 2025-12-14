/**
 * LanguageSwitcher Component
 *
 * Dropdown to switch between English and Georgian languages
 */

import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * LanguageSwitcher Component
 * Allows users to switch between available languages
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  /**
   * Handle language change
   */
  const handleLanguageChange = (value) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <span className="flex items-center gap-2">
            <span>EN</span>
            <span className="text-muted-foreground">{t('language.english')}</span>
          </span>
        </SelectItem>
        <SelectItem value="ka">
          <span className="flex items-center gap-2">
            <span>KA</span>
            <span className="text-muted-foreground">{t('language.georgian')}</span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
