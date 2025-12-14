/**
 * FeaturedEvents Component - Instagram Stories Style
 *
 * Features:
 * - Horizontal scrollable featured events
 * - Story-like circular avatars
 * - Gradient ring for unseen events
 * - Quick preview on hover
 */

import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Flame, Star, Zap, TrendingUp } from 'lucide-react';

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getInitials = (name) => {
  if (!name) return 'E';
  return name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
};

export default function FeaturedEvents({ events = [], onEventClick }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Get featured events (first 10 upcoming events)
  const featuredEvents = events
    .filter((event) => new Date(event.startDate) >= new Date())
    .slice(0, 10);

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-card rounded-2xl border p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Trending Events</h3>
            <p className="text-xs text-muted-foreground">Don't miss out!</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Create Event Card */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center border-2 border-dashed border-violet-300 group-hover:border-violet-500 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">+</span>
              </div>
            </div>
          </div>
          <span className="text-xs text-center font-medium text-muted-foreground group-hover:text-violet-600 transition-colors">
            Create Event
          </span>
        </div>

        {/* Featured Event Items */}
        {featuredEvents.map((event, index) => (
          <div
            key={event._id}
            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
            onClick={() => onEventClick?.(event)}
          >
            {/* Story Ring */}
            <div className="relative">
              {/* Gradient Ring */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[3px] transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg,
                    ${index % 3 === 0 ? '#f472b6, #a855f7, #6366f1' :
                      index % 3 === 1 ? '#fbbf24, #f97316, #ef4444' :
                      '#34d399, #22d3ee, #6366f1'})`,
                }}
              >
                <div className="w-full h-full rounded-full p-[2px] bg-card">
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={event.coverImage || DEFAULT_EVENT_IMAGE}
                      alt={event.title}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold">
                      {getInitials(event.title)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Badge Indicator */}
              {index < 3 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-card rounded-full flex items-center justify-center shadow-sm border">
                  {index === 0 && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                  {index === 1 && <Star className="w-3.5 h-3.5 text-yellow-500" />}
                  {index === 2 && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="text-center max-w-[80px]">
              <p className="text-xs font-medium truncate group-hover:text-violet-600 transition-colors">
                {event.title}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatDate(event.startDate)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Scrollbar Hide Style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
