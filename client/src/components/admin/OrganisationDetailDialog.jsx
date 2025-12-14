/**
 * OrganisationDetailDialog Component
 *
 * Displays full organisation details including:
 * - Cover image and logo
 * - All organisation information
 * - Admin list
 * - Contact details and social media
 */

import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Default placeholder images
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
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * DetailRow Component - displays a label and value pair
 */
function DetailRow({ label, value, isLink = false }) {
  if (!value) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm break-all">{value}</span>
      )}
    </div>
  );
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={organisation.coverImage || DEFAULT_COVER}
            alt={`${organisation.name} cover`}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Logo and Title overlay */}
          <div className="absolute bottom-4 left-4 flex items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarImage src={organisation.logo} alt={organisation.name} />
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {getInitials(organisation.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-white pb-1">
              <h2 className="text-2xl font-bold drop-shadow-md">
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
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              {t('common.description')}
            </h3>
            <p className="text-sm leading-relaxed">
              {organisation.description || t('organisations.noDescription')}
            </p>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t('organisations.contactInformation')}
            </h3>
            <div className="space-y-1">
              <DetailRow label={t('common.email')} value={organisation.email} />
              <DetailRow label={t('common.phone')} value={organisation.phone} />
              <DetailRow
                label={t('common.website')}
                value={organisation.website}
                isLink={true}
              />
            </div>
          </div>

          {/* Address */}
          {(organisation.address || organisation.location) && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {t('events.location')}
                </h3>
                <div className="space-y-1">
                  <DetailRow label={t('events.address')} value={organisation.address} />
                  <DetailRow label={t('events.location')} value={organisation.location} />
                </div>
              </div>
            </>
          )}

          {/* Social Media */}
          {organisation.socialMedia &&
            Object.values(organisation.socialMedia).some((v) => v) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    {t('organisations.socialMedia')}
                  </h3>
                  <div className="space-y-1">
                    <DetailRow
                      label="LinkedIn"
                      value={organisation.socialMedia?.linkedin}
                      isLink={true}
                    />
                    <DetailRow
                      label="Facebook"
                      value={organisation.socialMedia?.facebook}
                      isLink={true}
                    />
                    <DetailRow
                      label="Twitter"
                      value={organisation.socialMedia?.twitter}
                      isLink={true}
                    />
                    <DetailRow
                      label="Instagram"
                      value={organisation.socialMedia?.instagram}
                      isLink={true}
                    />
                  </div>
                </div>
              </>
            )}

          {/* Admins */}
          {organisation.admins && organisation.admins.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {t('organisations.admins')} ({organisation.admins.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {organisation.admins.map((admin) => {
                    const adminData =
                      typeof admin === 'object'
                        ? admin
                        : { _id: admin, name: t('common.unknown') };
                    return (
                      <div
                        key={adminData._id}
                        className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(adminData.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{adminData.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Metadata */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t('organisations.metadata')}
            </h3>
            <div className="space-y-1">
              <DetailRow label={t('organisations.organisationId')} value={organisation._id} />
              <DetailRow
                label={t('organisations.created')}
                value={formatDate(organisation.createdAt)}
              />
              <DetailRow
                label={t('organisations.lastUpdated')}
                value={formatDate(organisation.updatedAt)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
