/**
 * OrganisationCard Component - Modern Social Media Style
 *
 * Features:
 * - Modern card design with profile-like layout
 * - Follow button interaction
 * - Social links display
 * - Responsive and animated
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  Check,
} from 'lucide-react';

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=300&fit=crop';

const getTypeStyle = (type) => {
  const styles = {
    university: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    company: 'bg-green-500/10 text-green-600 border-green-500/20',
    institution: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return styles[type] || styles.other;
};

const getTypeLabel = (type) => {
  const labels = {
    university: 'University',
    company: 'Company',
    institution: 'Institution',
    other: 'Organization',
  };
  return labels[type] || 'Organization';
};

const getInitials = (name) => {
  if (!name) return 'O';
  return name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
};

export default function OrganisationCard({ organisation, onClick }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(
    Math.floor(Math.random() * 5000) + 500
  );

  const handleFollow = (e) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  const formatFollowers = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Card
      className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
      onClick={() => onClick?.(organisation)}
    >
      {/* Cover Image */}
      <div className="relative h-28 sm:h-32 overflow-hidden">
        <img
          src={organisation.coverImage || DEFAULT_COVER_IMAGE}
          alt={`${organisation.name} cover`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`${getTypeStyle(organisation.type)} border backdrop-blur-sm font-medium text-xs`}>
            {getTypeLabel(organisation.type)}
          </Badge>
        </div>
      </div>

      {/* Avatar - Overlapping Cover */}
      <div className="relative px-4">
        <div className="-mt-10 relative z-10">
          <div className="p-1 bg-card rounded-full inline-block shadow-lg">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-white">
              <AvatarImage src={organisation.logo} alt={organisation.name} />
              <AvatarFallback className="text-lg sm:text-xl font-bold bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                {getInitials(organisation.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <CardContent className="pt-2 pb-4 px-4">
        {/* Header with Follow Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-foreground truncate group-hover:text-violet-600 transition-colors">
              {organisation.name}
            </h3>
            {organisation.email && (
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                <Mail className="w-3 h-3 flex-shrink-0" />
                {organisation.email}
              </p>
            )}
          </div>

          <Button
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
            className={`flex-shrink-0 h-8 px-3 text-xs font-semibold transition-all ${
              isFollowing
                ? 'border-violet-200 text-violet-600 hover:bg-violet-50'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white'
            }`}
            onClick={handleFollow}
          >
            {isFollowing ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Following
              </>
            ) : (
              'Follow'
            )}
          </Button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {organisation.description}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4 text-violet-500" />
            <span className="font-semibold text-foreground">{formatFollowers(followerCount)}</span>
            <span className="hidden sm:inline">followers</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-4 h-4 text-violet-500" />
            <span className="font-semibold text-foreground">
              {Math.floor(Math.random() * 50) + 5}
            </span>
            <span className="hidden sm:inline">events</span>
          </div>
        </div>

        {/* Contact & Links */}
        <div className="flex flex-wrap items-center gap-2">
          {organisation.website && (
            <a
              href={organisation.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-violet-600 transition-colors bg-muted/50 hover:bg-violet-50 px-2.5 py-1.5 rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="w-3 h-3" />
              Website
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
          {organisation.phone && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-full">
              <Phone className="w-3 h-3" />
              {organisation.phone}
            </span>
          )}
          {organisation.address && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-full">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{organisation.address}</span>
            </span>
          )}
        </div>

        {/* Social Links */}
        {(organisation.socialLinks?.linkedin ||
          organisation.socialLinks?.facebook ||
          organisation.socialLinks?.twitter ||
          organisation.socialLinks?.instagram) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            {organisation.socialLinks?.linkedin && (
              <a
                href={organisation.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
            {organisation.socialLinks?.facebook && (
              <a
                href={organisation.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {organisation.socialLinks?.twitter && (
              <a
                href={organisation.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-gray-100 text-muted-foreground hover:text-gray-900 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {organisation.socialLinks?.instagram && (
              <a
                href={organisation.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-pink-50 text-muted-foreground hover:text-pink-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
