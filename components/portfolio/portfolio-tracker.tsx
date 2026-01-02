'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/utils/analytics';

interface PortfolioTrackerProps {
  username: string;
  wasCached: boolean;
  name?: string | null;
  avatarUrl?: string | null;
}

export function PortfolioTracker({ username, wasCached, name, avatarUrl }: PortfolioTrackerProps) {
  useEffect(() => {
    trackEvent('portfolio-viewed', {
      username,
      cached: wasCached,
    });

    // Track in database
    fetch('/api/portfolio/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        githubUsername: username,
        name: name || null,
        avatarUrl: avatarUrl || null,
      }),
    }).catch(console.error);

    if (wasCached === false) {
      trackEvent('portfolio-generated', {
        username,
      });
    }
  }, [username, wasCached, name, avatarUrl]);

  return null;
}

