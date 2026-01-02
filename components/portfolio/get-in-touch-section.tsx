import { FaGithub, FaEnvelope, FaLinkedin, FaXTwitter, FaGlobe } from 'react-icons/fa6';
import Link from 'next/link';
import type { NormalizedProfile } from '@/types/github';

interface GetInTouchSectionProps {
  profile: NormalizedProfile;
}

export function GetInTouchSection({ profile }: GetInTouchSectionProps) {
  const socialLinks = [
    {
      icon: <FaGithub className="w-5 h-5" />,
      href: `https://github.com/${profile.username}`,
      label: 'GitHub',
    },
    ...(profile.email
      ? [
          {
            icon: <FaEnvelope className="w-5 h-5" />,
            href: `mailto:${profile.email}`,
            label: 'Email',
          },
        ]
      : []),
    ...(profile.linkedin_url
      ? [
          {
            icon: <FaLinkedin className="w-5 h-5" />,
            href: profile.linkedin_url,
            label: 'LinkedIn',
          },
        ]
      : []),
    ...(profile.twitter_username
      ? [
          {
            icon: <FaXTwitter className="w-5 h-5" />,
            href: `https://twitter.com/${profile.twitter_username}`,
            label: 'Twitter',
          },
        ]
      : []),
    ...(profile.website
      ? [
          {
            icon: <FaGlobe className="w-5 h-5" />,
            href: profile.website,
            label: 'Website',
          },
        ]
      : []),
  ];

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl">
        <div className="flex flex-col items-center gap-6 sm:gap-8 text-center">
          <div className="flex justify-center space-x-6">
            {socialLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                aria-label={link.label}
              >
                {link.icon}
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {profile.name || profile.username}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

