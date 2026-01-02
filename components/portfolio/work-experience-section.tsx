import React from 'react';
import { FaBriefcase } from 'react-icons/fa';
import type { NormalizedProfile } from '@/types/github';
import SectionBorder from './section-border';

interface WorkExperienceSectionProps {
  profile: NormalizedProfile;
}

export function WorkExperienceSection({ profile }: WorkExperienceSectionProps) {
  if (!profile.company) {
    return null;
  }

  return (
    <section className="relative w-full py-8 sm:py-12 md:py-16">
      <SectionBorder className="absolute bottom-0 left-0 right-0" />
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="font-bold text-2xl md:text-4xl tracking-tight text-foreground">
            Work Experience
          </h2>
          <p className="text-muted-foreground mt-1 mb-4">
            Professional experiences as a software engineer
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-md border border-border hover:border-primary/20 hover:bg-muted/50 transition-colors">
            <FaBriefcase className="w-5 h-5 mt-1 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{profile.company.replace('@', '')}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {profile.bio || 'Software Engineer'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

