"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, BookOpen, Target, AlertTriangle, CheckCircle, RotateCcw } from "lucide-react"
import type { StudentData, Subject } from "@/app/page"

interface StudyScheduleProps {
  studentData: StudentData
  onContinue: () => void
  onStartOver: () => void
}

interface StudySession {
  subject: string
  duration: number
  priority: "high" | "medium" | "low"
  focus: string
  category: "weak" | "average" | "strong"
}

interface DaySchedule {
  day: string
  date: string
  sessions: StudySession[]
  totalHours: number
}

export function StudySchedule({ studentData, onContinue, onStartOver }: StudyScheduleProps) {
  const [selectedWeek, setSelectedWeek] = useState(0)

  const generateWeeklySchedule = useMemo(() => {
    const { subjects, studyHoursPerDay } = studentData

    // Calculate days until each exam
    const getExamUrgency = (examDate: string) => {
      const today = new Date()
      const exam = new Date(examDate)
      const diffTime = exam.getTime() - today.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    // Calculate priority weights
    const calculatePriority = (subject: Subject): number => {
      const urgencyDays = getExamUrgency(subject.examDate)
      const performanceWeight = subject.category === "weak" ? 3 : subject.category === "average" ? 2 : 1
      const urgencyWeight = urgencyDays <= 7 ? 3 : urgencyDays <= 14 ? 2 : 1
      return performanceWeight * urgencyWeight
    }

    // Sort subjects by priority
    const prioritizedSubjects = [...subjects].sort((a, b) => calculatePriority(b) - calculatePriority(a))

    // Generate 7-day schedule
    const schedule: DaySchedule[] = []
    const today = new Date()

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + dayOffset + selectedWeek * 7)

      const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" })
      const dateString = currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })

      // Allocate study time based on priority
      const sessions: StudySession[] = []
      let remainingHours = studyHoursPerDay

      // Weekend adjustment (more hours available)
      if (dayOffset === 5 || dayOffset === 6) {
        // Saturday, Sunday
        remainingHours = Math.min(studyHoursPerDay * 1.5, 8)
      }

      // Distribute time among subjects
      const totalPriorityWeight = prioritizedSubjects.reduce((sum, subject) => sum + calculatePriority(subject), 0)

      prioritizedSubjects.forEach((subject) => {
        const priority = calculatePriority(subject)
        const timeAllocation = (priority / totalPriorityWeight) * remainingHours
        const sessionDuration = Math.max(0.5, Math.round(timeAllocation * 2) / 2) // Round to nearest 0.5 hour

        if (sessionDuration >= 0.5) {
          const sessionPriority: "high" | "medium" | "low" =
            subject.category === "weak" ? "high" : subject.category === "average" ? "medium" : "low"

          const focus =
            subject.category === "weak"
              ? "Review basics & practice problems"
              : subject.category === "average"
                ? "Practice & strengthen concepts"
                : "Maintain & review key topics"

          sessions.push({
            subject: subject.name,
            duration: sessionDuration,
            priority: sessionPriority,
            focus,
            category: subject.category,
          })
        }
      })

      schedule.push({
        day: dayName,
        date: dateString,
        sessions,
        totalHours: sessions.reduce((sum, session) => sum + session.duration, 0),
      })
    }

    return schedule
  }, [studentData, selectedWeek])

  const weeklyStats = useMemo(() => {
    const totalHours = generateWeeklySchedule.reduce((sum, day) => sum + day.totalHours, 0)
    const subjectHours = new Map<string, number>()

    generateWeeklySchedule.forEach((day) => {
      day.sessions.forEach((session) => {
        const current = subjectHours.get(session.subject) || 0
        subjectHours.set(session.subject, current + session.duration)
      })
    })

    return {
      totalHours,
      subjectHours: Array.from(subjectHours.entries()).map(([subject, hours]) => ({
        subject,
        hours,
      })),
    }
  }, [generateWeeklySchedule])

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-primary text-primary-foreground"
    }
  }

  const getPriorityIcon = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-3 w-3" />
      case "medium":
        return <Target className="h-3 w-3" />
      case "low":
        return <CheckCircle className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Personalized Study Schedule</h2>
        <p className="text-lg text-muted-foreground">
          AI-generated weekly schedule based on your performance and exam dates
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
          disabled={selectedWeek === 0}
        >
          Previous Week
        </Button>
        <div className="text-center">
          <p className="font-medium text-foreground">Week {selectedWeek + 1}</p>
          <p className="text-sm text-muted-foreground">
            {generateWeeklySchedule[0]?.date} - {generateWeeklySchedule[6]?.date}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSelectedWeek(selectedWeek + 1)} disabled={selectedWeek >= 3}>
          Next Week
        </Button>
      </div>

      {/* Weekly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Study Hours</p>
                <p className="text-2xl font-bold text-foreground">{weeklyStats.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold text-foreground">{(weeklyStats.totalHours / 7).toFixed(1)}h</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subjects Covered</p>
                <p className="text-2xl font-bold text-foreground">{weeklyStats.subjectHours.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Time Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Weekly Time Allocation
          </CardTitle>
          <CardDescription>How your study time is distributed across subjects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyStats.subjectHours.map(({ subject, hours }, index) => {
            const percentage = (hours / weeklyStats.totalHours) * 100
            const subjectData = studentData.subjects.find((s) => s.name === subject)

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{subject}</span>
                    <Badge
                      variant={
                        subjectData?.category === "weak"
                          ? "destructive"
                          : subjectData?.category === "average"
                            ? "secondary"
                            : "default"
                      }
                      className={
                        subjectData?.category === "average"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : ""
                      }
                    >
                      {subjectData?.category}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">
                    {hours.toFixed(1)}h ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Daily Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {generateWeeklySchedule.map((day, dayIndex) => (
          <Card key={dayIndex} className={`${dayIndex >= 5 ? "bg-muted/30" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{day.day}</CardTitle>
                <Badge variant="outline">{day.date}</Badge>
              </div>
              <CardDescription>{day.totalHours.toFixed(1)} hours total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {day.sessions.length > 0 ? (
                day.sessions.map((session, sessionIndex) => (
                  <div key={sessionIndex} className="p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{session.subject}</span>
                      <div className="flex items-center gap-1">
                        <Badge className={`text-xs ${getPriorityColor(session.priority)}`}>
                          {getPriorityIcon(session.priority)}
                          {session.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      {session.duration} hour{session.duration !== 1 ? "s" : ""}
                    </div>
                    <p className="text-xs text-muted-foreground">{session.focus}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <RotateCcw className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Rest day</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-6">
        <Button variant="outline" onClick={onStartOver}>
          Start Over
        </Button>
        <Button onClick={onContinue} size="lg" className="px-8">
          View Recommendations
        </Button>
      </div>
    </div>
  )
}
