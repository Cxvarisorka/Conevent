/**
 * OrganisationDetailDialog Component (User Version)
 *
 * Displays organisation details for regular users:
 * - Cover image and logo
 * - Name, type, and description
 * - Contact information
 * - Social media links
 */

import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

// Default placeholder image
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=300&fit=crop';

/**
 * Get organisation type badge color
 */
const getTypeColor = (type) => {
  const colors = {
    university: 'bg-blue-100 text-blue-800',
    company: 'bg-green-100 text-green-800',
    institution: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || colors.other;
};

/**
 * Get initials from name
 */
const getInitials = (name) => {
  if (!name) return 'O';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * ContactItem Component - displays contact info with icon
 */
function ContactItem({ icon, label, value, href }) {
  if (!value) return null;

  const content = (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}

/**
 * OrganisationDetailDialog Component
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Handler for dialog open state change
 * @param {object} organisation - Organisation data to display
 */
export default function OrganisationDetailDialog({
  open,
  onOpenChange,
  organisation,
}) {
  const { t } = useTranslation();

  if (!organisation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
        {/* Cover Image with Logo overlay */}
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={organisation.coverImage || DEFAULT_COVER}
            alt={`${organisation.name} cover`}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Logo and Title overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg flex-shrink-0">
              <AvatarImage src={organisation.logo} alt={organisation.name} />
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {getInitials(organisation.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-white pb-1 flex-1 min-w-0">
              <h2 className="text-2xl font-bold drop-shadow-md truncate">
                {organisation.name}
              </h2>
              <Badge className={`${getTypeColor(organisation.type)} mt-1`}>
                {organisation.type}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          {organisation.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">{t('organisations.about')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {organisation.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('events.contact')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ContactItem
                icon="📧"
                label={t('common.email')}
                value={organisation.email}
                href={`mailto:${organisation.email}`}
              />
              <ContactItem
                icon="📞"
                label={t('common.phone')}
                value={organisation.phone}
                href={`tel:${organisation.phone}`}
              />
              <ContactItem
                icon="🌐"
                label={t('common.website')}
                value={organisation.website ? new URL(organisation.website).hostname : null}
                href={organisation.website}
              />
              <ContactItem
                icon="📍"
                label={t('events.address')}
                value={organisation.address}
              />
            </div>
          </div>

          {/* Social Media */}
          {organisation.socialMedia &&
            Object.values(organisation.socialMedia).some((v) => v) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3">{t('organisations.socialMedia')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {organisation.socialMedia?.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={organisation.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {organisation.socialMedia?.facebook && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={organisation.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Facebook
                        </a>
                      </Button>
                    )}
                    {organisation.socialMedia?.twitter && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={organisation.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Twitter
                        </a>
                      </Button>
                    )}
                    {organisation.socialMedia?.instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={organisation.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Instagram
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

          {/* Close Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
