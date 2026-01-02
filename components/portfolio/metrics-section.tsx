import { Card, CardContent } from "@/components/ui/card"
import { FaCodeBranch, FaCodePullRequest } from "react-icons/fa6"
import type { GitHubMetrics } from "@/types/github"

interface MetricsSectionProps {
  metrics?: GitHubMetrics | null
}

export function MetricsSection({ metrics }: MetricsSectionProps) {
  if (!metrics) return null

  const statCards = [
    {
      label: "PRs Merged",
      value: metrics.prs_merged.toLocaleString(),
      icon: FaCodeBranch,
      bgColor: "bg-chart-1/10",
      iconColor: "text-chart-1",
    },
    {
      label: "Open PRs",
      value: metrics.prs_open.toLocaleString(),
      icon: FaCodePullRequest,
      bgColor: "bg-chart-2/10",
      iconColor: "text-chart-2",
    },
  ]

  return (
    <section className="w-full py-16 border-b border-border">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Metrics</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Overview of development activity and engagement
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card 
                key={stat.label} 
                className="hover:shadow-md transition-all duration-200 hover:border-primary/20 group"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

