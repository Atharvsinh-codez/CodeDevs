'use client'

interface DiagonalPatternProps {
  side: 'left' | 'right'
  className?: string
}

export default function DiagonalPattern({ side, className = '' }: DiagonalPatternProps) {
  return (
    <div className={`absolute ${side}-0 top-0 w-[60px] h-full overflow-hidden sm:block hidden ${className}`}>
      <div 
        className="absolute dark:opacity-[0.04] opacity-[0.06] inset-0 w-[60px] h-full border dark:border-[#eee] border-[#000]/70"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 2px, currentcolor 2px, currentcolor 3px, transparent 3px, transparent 6px)'
        }}
      />
    </div>
  )
}

