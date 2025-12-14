/**
 * EventDetailDialog Component (User Version)
 *
 * Displays event details for regular users with:
 * - Event images
 * - Full event information
 * - Participate button
 */

import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Default placeholder image
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';

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
 * Get category badge color
 */
const getCategoryColor = (category) => {
  const colors = {
    conference: 'bg-blue-100 text-blue-800',
    workshop: 'bg-green-100 text-green-800',
    seminar: 'bg-purple-100 text-purple-800',
    meetup: 'bg-orange-100 text-orange-800',
    webinar: 'bg-cyan-100 text-cyan-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors.other;
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
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format price for display
 */
const formatPrice = (price, currency = 'USD') => {
  if (!price || price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

/**
 * InfoItem Component - displays info with icon
 */
function InfoItem({ icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

/**
 * EventDetailDialog Component
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Handler for dialog open state change
 * @param {object} event - Event data to display
 * @param {function} onParticipate - Handler for participate button click
 */
export default function EventDetailDialog({
  open,
  onOpenChange,
  event,
  onParticipate,
}) {
  if (!event) return null;

  const isRegistrationOpen = event.status === 'published' &&
    (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date());

  const spotsAvailable = event.capacity
    ? event.capacity - (event.registeredCount || 0)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-0">
        {/* Event Image */}
        <div className="relative h-56 overflow-hidden rounded-t-lg">
          <img
            src={event.coverImage || event.images?.[0] || DEFAULT_IMAGE}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className={getStatusColor(event.status)}>
              {event.status}
            </Badge>
            <Badge className={getCategoryColor(event.category)}>
              {event.category}
            </Badge>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold drop-shadow-md line-clamp-2">
              {event.title}
            </h2>
            {event.organisationId && (
              <p className="text-sm text-white/80 mt-1">
                by {event.organisationId.name || 'Unknown Organisation'}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              icon="📅"
              label="Date"
              value={formatDate(event.startDate)}
            />
            <InfoItem
              icon="⏰"
              label="Time"
              value={`${formatTime(event.startDate)}${event.endDate ? ` - ${formatTime(event.endDate)}` : ''}`}
            />
            <InfoItem
              icon="📍"
              label="Location"
              value={event.location || event.venue}
            />
            <InfoItem
              icon="💰"
              label="Price"
              value={formatPrice(event.price, event.currency)}
            />
            {event.capacity && (
              <InfoItem
                icon="👥"
                label="Capacity"
                value={`${spotsAvailable} spots left of ${event.capacity}`}
              />
            )}
            {event.eventType && (
              <InfoItem
                icon="🎯"
                label="Type"
                value={event.eventType}
              />
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2">About this event</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Registration Deadline */}
          {event.registrationDeadline && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-amber-500">⚠️</span>
                <span>Registration deadline: {formatDate(event.registrationDeadline)}</span>
              </div>
            </>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              className="flex-1"
              onClick={() => onParticipate?.(event)}
              disabled={!isRegistrationOpen || (spotsAvailable !== null && spotsAvailable <= 0)}
            >
              {event.status === 'cancelled'
                ? 'Event Cancelled'
                : event.status === 'completed'
                ? 'Event Ended'
                : spotsAvailable !== null && spotsAvailable <= 0
                ? 'Sold Out'
                : !isRegistrationOpen
                ? 'Registration Closed'
                : event.price && event.price > 0
                ? `Register - ${formatPrice(event.price, event.currency)}`
                : 'Participate - Free'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
