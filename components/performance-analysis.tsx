"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, BarChart3, Calendar } from "lucide-react"
import type { StudentData } from "@/app/page"

interface PerformanceAnalysisProps {
  studentData: StudentData
  onContinue: () => void
  onStartOver: () => void
}

export function PerformanceAnalysis({ studentData, onContinue, onStartOver }: PerformanceAnalysisProps) {
  const { subjects } = studentData

  // Calculate statistics
  const weakSubjects = subjects.filter((s) => s.category === "weak")
  const averageSubjects = subjects.filter((s) => s.category === "average")
  const strongSubjects = subjects.filter((s) => s.category === "strong")

  const overallAverage = subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length

  // Calculate days until exams
  const getExamUrgency = (examDate: string) => {
    const today = new Date()
    const exam = new Date(examDate)
    const diffTime = exam.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Sort subjects by urgency (exam date)
  const subjectsByUrgency = [...subjects].sort((a, b) => getExamUrgency(a.examDate) - getExamUrgency(b.examDate))

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return "text-destructive"
    if (days <= 14) return "text-yellow-600 dark:text-yellow-400"
    return "text-muted-foreground"
  }

  const getUrgencyBadge = (days: number) => {
    if (days <= 7) return { variant: "destructive" as const, text: "Urgent" }
    if (days <= 14) return { variant: "secondary" as const, text: "Soon" }
    return { variant: "outline" as const, text: "Later" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Performance Analysis</h2>
        <p className="text-lg text-muted-foreground">Here's your academic performance breakdown and priority areas</p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Average</p>
                <p className="text-2xl font-bold text-foreground">{overallAverage.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weak Subjects</p>
                <p className="text-2xl font-bold text-destructive">{weakSubjects.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Subjects</p>
                <p className="text-2xl font-bold text-yellow-600">{averageSubjects.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Strong Subjects</p>
                <p className="text-2xl font-bold text-primary">{strongSubjects.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Subject */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Subject Performance
            </CardTitle>
            <CardDescription>Your current scores across all subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{subject.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{subject.score}%</span>
                    <Badge
                      variant={
                        subject.category === "weak"
                          ? "destructive"
                          : subject.category === "average"
                            ? "secondary"
                            : "default"
                      }
                      className={
                        subject.category === "average"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : ""
                      }
                    >
                      {subject.category}
                    </Badge>
                  </div>
                </div>
                <Progress value={subject.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Exam Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Exam Timeline
            </CardTitle>
            <CardDescription>Upcoming exams sorted by urgency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectsByUrgency.map((subject, index) => {
              const daysUntilExam = getExamUrgency(subject.examDate)
              const urgencyBadge = getUrgencyBadge(daysUntilExam)

              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(subject.examDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getUrgencyColor(daysUntilExam)}`}>
                      {daysUntilExam} days
                    </span>
                    <Badge variant={urgencyBadge.variant}>{urgencyBadge.text}</Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Priority Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Priority Areas for Improvement
          </CardTitle>
          <CardDescription>Based on your performance and exam dates, here are your focus areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weak subjects with upcoming exams */}
            {weakSubjects.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-destructive flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Critical - Weak Subjects
                </h4>
                {weakSubjects.map((subject, index) => (
                  <div key={index} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-sm text-destructive">{subject.score}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Exam in {getExamUrgency(subject.examDate)} days - Needs immediate attention
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Average subjects with upcoming exams */}
            {averageSubjects.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Moderate - Average Subjects
                </h4>
                {averageSubjects.map((subject, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-sm text-yellow-600">{subject.score}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Exam in {getExamUrgency(subject.examDate)} days - Room for improvement
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {weakSubjects.length === 0 && averageSubjects.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-medium text-foreground mb-2">Excellent Performance!</h4>
              <p className="text-muted-foreground">
                All your subjects are in the strong category. Focus on maintaining your performance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-6">
        <Button variant="outline" onClick={onStartOver}>
          Start Over
        </Button>
        <Button onClick={onContinue} size="lg" className="px-8">
          Generate Study Schedule
        </Button>
      </div>
    </div>
  )
}
