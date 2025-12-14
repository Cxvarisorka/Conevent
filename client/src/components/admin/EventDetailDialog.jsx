/**
 * EventDetailDialog Component
 *
 * Displays full event details including:
 * - Cover image and additional images
 * - All event information
 * - Date and time details
 * - Location information
 * - Pricing and capacity
 * - Organisation info
 */

import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Default placeholder image
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';

/**
 * Get category badge color
 */
const getCategoryColor = (category) => {
  const colors = {
    workshop: 'bg-blue-100 text-blue-800',
    seminar: 'bg-purple-100 text-purple-800',
    conference: 'bg-indigo-100 text-indigo-800',
    webinar: 'bg-cyan-100 text-cyan-800',
    hackathon: 'bg-orange-100 text-orange-800',
    'career-fair': 'bg-green-100 text-green-800',
    networking: 'bg-pink-100 text-pink-800',
    competition: 'bg-red-100 text-red-800',
    cultural: 'bg-yellow-100 text-yellow-800',
    sports: 'bg-emerald-100 text-emerald-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors.other;
};

/**
 * Get status badge color
 */
const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || colors.draft;
};

/**
 * Get event type info
 */
const getEventTypeInfo = (eventType) => {
  const types = {
    online: { label: 'Online', icon: '🌐', color: 'bg-cyan-100 text-cyan-800' },
    offline: { label: 'In-Person', icon: '📍', color: 'bg-orange-100 text-orange-800' },
    hybrid: { label: 'Hybrid', icon: '🔄', color: 'bg-violet-100 text-violet-800' },
  };
  return types[eventType] || types.offline;
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for display
 */
const formatTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format datetime for display
 */
const formatDateTime = (date) => {
  if (!date) return '-';
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * DetailRow Component - displays a label and value pair
 */
function DetailRow({ label, value, isLink = false }) {
  if (value === undefined || value === null || value === '') return null;

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
        <span className="text-sm break-all">{String(value)}</span>
      )}
    </div>
  );
}

/**
 * EventDetailDialog Component
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Handler for dialog open state change
 * @param {object} event - Event data to display
 */
export default function EventDetailDialog({ open, onOpenChange, event }) {
  const { t } = useTranslation();

  if (!event) return null;

  const eventTypeInfo = getEventTypeInfo(event.eventType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
        {/* Cover Image */}
        <div className="relative h-56 overflow-hidden rounded-t-lg">
          <img
            src={event.coverImage || DEFAULT_COVER}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={getCategoryColor(event.category)}>
              {event.category?.replace('-', ' ')}
            </Badge>
            <Badge className={eventTypeInfo.color}>
              {eventTypeInfo.icon} {eventTypeInfo.label}
            </Badge>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className={getStatusColor(event.status)}>
              {event.status}
            </Badge>
            <Badge variant={event.isFree ? 'secondary' : 'default'}>
              {event.isFree ? t('common.free') : `$${event.price} ${event.currency || 'USD'}`}
            </Badge>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold drop-shadow-md mb-1">
              {event.title}
            </h2>
            {event.organisationId && (
              <p className="text-sm opacity-90 drop-shadow-md">
                by {event.organisationId.name || 'Unknown Organisation'}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              {t('common.description')}
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {event.description || t('events.noDescription')}
            </p>
          </div>

          <Separator />

          {/* Date & Time */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t('events.dateAndTime')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">{t('events.starts')}</p>
                <p className="text-sm font-medium">{formatDate(event.startDate)}</p>
                <p className="text-sm text-muted-foreground">{formatTime(event.startDate)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">{t('events.ends')}</p>
                <p className="text-sm font-medium">{formatDate(event.endDate)}</p>
                <p className="text-sm text-muted-foreground">{formatTime(event.endDate)}</p>
              </div>
            </div>
            {event.registrationEndDate && (
              <p className="text-sm text-muted-foreground mt-3">
                Registration closes: {formatDateTime(event.registrationEndDate)}
              </p>
            )}
          </div>

          <Separator />

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t('events.location')}
            </h3>
            {event.eventType === 'online' ? (
              <div className="space-y-2">
                <p className="text-sm">{t('events.onlineEvent')}</p>
                {event.onlineLink && (
                  <DetailRow label={t('events.meetingLink')} value={event.onlineLink} isLink={true} />
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <DetailRow label={t('events.city')} value={event.city} />
                <DetailRow label={t('events.address')} value={event.address} />
                {event.eventType === 'hybrid' && event.onlineLink && (
                  <DetailRow label={t('events.onlineLink')} value={event.onlineLink} isLink={true} />
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Capacity & Registration */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t('events.capacityAndRegistration')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{event.capacity || '-'}</p>
                <p className="text-xs text-muted-foreground">{t('events.totalCapacity')}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{event.registeredCount || 0}</p>
                <p className="text-xs text-muted-foreground">{t('events.registered')}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">
                  {event.capacity ? event.capacity - (event.registeredCount || 0) : '-'}
                </p>
                <p className="text-xs text-muted-foreground">{t('events.available')}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">
                  {event.isFree ? t('common.free') : `$${event.price}`}
                </p>
                <p className="text-xs text-muted-foreground">{t('common.price')}</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {event.requirements && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {t('events.requirements')}
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {event.requirements}
                </p>
              </div>
            </>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {t('events.tags')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Additional Images */}
          {event.images && event.images.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {t('events.gallery')} ({event.images.length} {t('events.images')})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {event.images.map((img, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={img}
                        alt={`Event image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Contact Information */}
          {(event.contactEmail || event.contactPhone) && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {t('events.contact')}
                </h3>
                <div className="space-y-1">
                  <DetailRow label={t('common.email')} value={event.contactEmail} />
                  <DetailRow label={t('common.phone')} value={event.contactPhone} />
                </div>
              </div>
            </>
          )}

          {/* Organisation Details */}
          {event.organisationId && typeof event.organisationId === 'object' && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {t('events.organisedBy')}
                </h3>
                <div className="flex items-center gap-4 bg-muted/50 rounded-lg p-4">
                  {event.organisationId.logo && (
                    <img
                      src={event.organisationId.logo}
                      alt={event.organisationId.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{event.organisationId.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {event.organisationId.type}
                    </p>
                    {event.organisationId.email && (
                      <p className="text-sm text-muted-foreground">
                        {event.organisationId.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Metadata */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t('events.metadata')}
            </h3>
            <div className="space-y-1">
              <DetailRow label={t('events.eventId')} value={event._id} />
              <DetailRow label={t('events.created')} value={formatDate(event.createdAt)} />
              <DetailRow label={t('events.lastUpdated')} value={formatDate(event.updatedAt)} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
