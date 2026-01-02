'use client'

interface SectionBorderProps {
  className?: string
}

export default function SectionBorder({ className = '' }: SectionBorderProps) {
  return (
    <div className={`border-b border-dashed border-border/60 ${className}`} />
  )
}

