/**
 * EventCard Component - Modern Social Media Style
 *
 * Features:
 * - Wide card design with more content
 * - Social interactions (like, bookmark, share)
 * - Responsive layout
 * - Gradient overlays and smooth animations
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Bookmark,
  Share2,
  MapPin,
  Calendar,
  Clock,
  Users,
  Wifi,
  Globe,
  ChevronRight,
  MessageCircle,
  DollarSign,
  Tag,
} from 'lucide-react';

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCategoryStyle = (category) => {
  const styles = {
    workshop: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    seminar: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    conference: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    webinar: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    hackathon: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'career-fair': 'bg-green-500/10 text-green-600 border-green-500/20',
    networking: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    competition: 'bg-red-500/10 text-red-600 border-red-500/20',
    cultural: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    sports: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return styles[category] || styles.other;
};

const getEventTypeIcon = (eventType) => {
  switch (eventType) {
    case 'online':
      return <Wifi className="w-3.5 h-3.5" />;
    case 'hybrid':
      return <Globe className="w-3.5 h-3.5" />;
    default:
      return <MapPin className="w-3.5 h-3.5" />;
  }
};

const getEventTypeLabel = (eventType) => {
  switch (eventType) {
    case 'online':
      return 'Online Event';
    case 'hybrid':
      return 'Hybrid Event';
    default:
      return 'In-Person';
  }
};

const getInitials = (name) => {
  if (!name) return 'O';
  return name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
};

export default function EventCard({ event, onClick }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 200) + 20);
  const [commentCount] = useState(Math.floor(Math.random() * 50) + 5);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    }
  };

  const spotsLeft = event.capacity ? event.capacity - (event.registeredCount || 0) : null;
  const isAlmostFull = spotsLeft !== null && spotsLeft <= 10;
  const progressPercent = event.capacity ? ((event.registeredCount || 0) / event.capacity) * 100 : 0;

  return (
    <Card
      className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
      onClick={() => onClick?.(event)}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={event.coverImage || DEFAULT_EVENT_IMAGE}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            <Badge className={`${getCategoryStyle(event.category)} border backdrop-blur-sm font-medium text-xs`}>
              {event.category?.replace('-', ' ')}
            </Badge>
            <Badge className="bg-black/40 backdrop-blur-sm text-white border-0 font-medium text-xs">
              {getEventTypeLabel(event.eventType)}
            </Badge>
          </div>

          <Badge
            className={`backdrop-blur-sm font-bold text-sm px-3 ${
              event.isFree
                ? 'bg-green-500/90 text-white border-0'
                : 'bg-white/95 text-gray-900 border-0'
            }`}
          >
            {event.isFree ? 'FREE' : `$${event.price}`}
          </Badge>
        </div>

        {/* Bottom Info on Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white text-sm">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatTime(event.startDate)}</span>
              </div>
            </div>

            {isAlmostFull && (
              <div className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold">{spotsLeft} left!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Organisation Info */}
        {event.organisationId && (
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10 border-2 border-violet-100 shadow-sm">
              <AvatarImage src={event.organisationId.logo} alt={event.organisationId.name} />
              <AvatarFallback className="text-sm bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                {getInitials(event.organisationId.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {event.organisationId.name}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Verified Organizer
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-lg sm:text-xl text-foreground line-clamp-2 mb-2 group-hover:text-violet-600 transition-colors leading-tight">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Event Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            {getEventTypeIcon(event.eventType)}
            <span>{event.eventType === 'online' ? 'Online' : event.city || 'TBA'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <Users className="w-4 h-4 text-violet-500" />
            <span>{event.capacity ? `${event.capacity} capacity` : 'Unlimited'}</span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        {event.capacity && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{event.registeredCount || 0} registered</span>
              <span>{event.capacity} spots</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent > 80
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : progressPercent > 50
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-violet-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tags/Keywords */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      {/* Social Actions Footer */}
      <CardFooter className="px-5 py-4 border-t bg-muted/30">
        <div className="flex items-center justify-between w-full">
          {/* Left Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 gap-2 transition-all ${
                isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 gap-2 text-muted-foreground hover:text-foreground transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{commentCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 transition-all ${
                isBookmarked ? 'text-violet-500 hover:text-violet-600' : 'text-muted-foreground hover:text-violet-500'
              }`}
              onClick={handleBookmark}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-muted-foreground hover:text-foreground transition-all"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Right - CTA */}
          <Button
            size="sm"
            className="h-9 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md shadow-violet-500/20"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(event);
            }}
          >
            <span className="font-semibold">View Event</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
