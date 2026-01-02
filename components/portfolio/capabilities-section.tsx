import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { AboutData } from "@/types/github"
import SectionBorder from "./section-border"

interface CapabilitiesSectionProps {
  about?: AboutData | null
}

export function CapabilitiesSection({ about }: CapabilitiesSectionProps) {
  if (!about) return null

  return (
    <section className="relative w-full py-8 sm:py-12 md:py-16">
      <SectionBorder className="absolute bottom-0 left-0 right-0" />
      <div className="space-y-8 sm:space-y-10 md:space-y-12">
        <div>
          <h2 className="font-bold text-2xl md:text-4xl tracking-tight text-foreground mb-2">
            About
          </h2>
          {about.summary && (
            <p className="text-base sm:text-lg text-foreground/90 leading-relaxed max-w-4xl mt-4">
              {about.summary}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {about.highlights && about.highlights.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                  Highlights
                </h3>
                <ul className="space-y-4">
                  {about.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-foreground/90 leading-relaxed flex-1">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {about.skills && about.skills.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {about.skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-secondary/60 hover:bg-secondary/80 transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}

