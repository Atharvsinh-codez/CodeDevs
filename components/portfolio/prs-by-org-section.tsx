"use client";

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { FaCodePullRequest, FaChevronDown } from "react-icons/fa6"
import Link from "next/link"
import SectionBorder from "./section-border"

export interface PRByOrg {
  orgName: string;
  orgAvatar: string;
  orgLogin: string;
  prs: Array<{
    number: number;
    title: string;
    url: string;
    state: string;
    mergedAt: string | null;
    createdAt: string;
    updatedAt: string;
    repository: string;
    baseRef: string;
    headRef: string;
    ownerLogin: string;
  }>;
}

interface PRsByOrgSectionProps {
  prsByOrg: PRByOrg[];
  username: string;
}

export function PRsByOrgSection({ prsByOrg, username }: PRsByOrgSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!prsByOrg || prsByOrg.length === 0) {
    return null;
  }

  const allPRs = prsByOrg.flatMap(org => {
    if (!org.prs || org.prs.length === 0) {
      return [];
    }
    return org.prs.map(pr => ({
      ...pr,
      orgName: org.orgName,
      orgAvatar: org.orgAvatar,
      orgLogin: org.orgLogin || org.orgName,
      ownerLogin: pr.ownerLogin || org.orgLogin || org.orgName,
    }));
  });

  if (allPRs.length === 0) {
    return null;
  }

  const filteredPRs = allPRs.filter(pr => {
    const ownerLogin = pr.ownerLogin || pr.orgLogin;
    if (!ownerLogin) {
      return true;
    }
    return ownerLogin.toLowerCase() !== username.toLowerCase();
  });

  const sortedPRs = filteredPRs.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (sortedPRs.length === 0) {
    return null;
  }

  const visiblePRs = isExpanded ? sortedPRs : sortedPRs.slice(0, 7);
  const hasMore = sortedPRs.length > 7;

  return (
    <section className="relative w-full py-8 sm:py-12 md:py-16">
      <SectionBorder className="absolute bottom-0 left-0 right-0" />
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Open Source Contributions</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pull requests across different organizations
          </p>
        </div>

        <div className="space-y-2">
          {visiblePRs.map((pr, index) => (
            <Link
              key={`${pr.orgLogin || pr.orgName}-${pr.number}-${index}`}
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-md border-2 border-border hover:border-primary/20 hover:bg-muted/50 transition-colors group"
            >
              <FaCodePullRequest className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              <Avatar className="h-5 w-5 border border-border flex-shrink-0">
                <AvatarImage src={pr.orgAvatar} alt={pr.orgName} />
                <AvatarFallback className="text-[10px] font-medium">
                  {pr.orgName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate flex-1">
                {pr.title}
              </span>
            </Link>
          ))}
          
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center gap-2 w-full p-3 rounded-md border-2 border-border hover:border-primary/20 hover:bg-muted/50 transition-colors group"
            >
              <FaChevronDown 
                className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                {isExpanded ? 'Show less' : `Show all ${sortedPRs.length} PRs`}
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

