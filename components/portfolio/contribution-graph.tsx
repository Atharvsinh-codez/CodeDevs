"use client"

import React from "react"
import { GitHubCalendar } from "react-github-calendar"
import { Card, CardContent } from "@/components/ui/card"

interface ContributionGraphProps {
  username: string
}

export function ContributionGraph({ username }: ContributionGraphProps) {
  const [mounted, setMounted] = React.useState(false)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    setMounted(true)
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const theme = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  }

  const isMobile = dimensions.width < 640
  const isTablet = dimensions.width >= 640 && dimensions.width < 1024

  const blockSize = isMobile ? 10 : isTablet ? 11 : 13
  const blockMargin = isMobile ? 3 : isTablet ? 3 : 4
  const fontSize = isMobile ? 10 : 11

  if (!mounted) {
    return (
      <section className="w-full py-8 sm:py-12 md:py-16 border-b border-border">
        <div className="space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Contributions</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Activity over the past year
            </p>
          </div>
          <Card className="border-border">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="w-full h-[140px] sm:h-[180px] md:h-[220px] bg-muted/50 animate-pulse rounded-md" />
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-8 sm:py-12 md:py-16 border-b border-border">
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Contributions</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
            Activity over the past year
          </p>
        </div>
        <Card className="border-border">
          <CardContent className="p-3 sm:p-6 md:p-8 lg:p-10">
            <div className="w-full overflow-x-auto">
              <div className={`${isMobile ? "min-w-[650px]" : "w-full"} flex justify-center`}>
                <GitHubCalendar
                  username={username}
                  fontSize={fontSize}
                  blockSize={blockSize}
                  blockMargin={blockMargin}
                  showWeekdayLabels={true}
                  colorScheme="light"
                  theme={{
                    light: theme.light,
                    dark: theme.dark,
                  }}
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

