import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaBriefcase, FaGraduationCap } from "react-icons/fa"
import type { LinkedInData } from "@/types/portfolio"

interface ExperienceSectionProps {
  linkedin?: LinkedInData
}

export function ExperienceSection({ linkedin }: ExperienceSectionProps) {
  if (!linkedin) return null

  const hasExperience = linkedin.experience && linkedin.experience.length > 0
  const hasEducation = linkedin.education && linkedin.education.length > 0

  if (!hasExperience && !hasEducation) return null

  return (
    <section className="w-full py-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Experience & Education</h2>

      <div className="space-y-6">
        {hasExperience && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FaBriefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {linkedin.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <h3 className="font-semibold">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                    {exp.description && (
                      <p className="text-sm mt-2 text-foreground/80">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {hasEducation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FaGraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {linkedin.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <h3 className="font-semibold">{edu.school}</h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.degree} in {edu.field}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{edu.duration}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

