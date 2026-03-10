"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Lightbulb,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
  FileText,
  Users,
  Calendar,
  Star,
  Zap,
} from "lucide-react"
import type { StudentData } from "@/app/page"

interface RecommendationsDashboardProps {
  studentData: StudentData
  onStartOver: () => void
}

interface Recommendation {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "study-technique" | "time-management" | "exam-prep" | "motivation"
  subject?: string
  icon: React.ReactNode
}

export function RecommendationsDashboard({ studentData, onStartOver }: RecommendationsDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const recommendations = useMemo(() => {
    const { subjects } = studentData
    const recs: Recommendation[] = []

    // Get weak and average subjects
    const weakSubjects = subjects.filter((s) => s.category === "weak")
    const averageSubjects = subjects.filter((s) => s.category === "average")

    // Calculate days until exams
    const getExamUrgency = (examDate: string) => {
      const today = new Date()
      const exam = new Date(examDate)
      const diffTime = exam.getTime() - today.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    // General study technique recommendations
    recs.push({
      id: "active-recall",
      title: "Use Active Recall Technique",
      description:
        "Instead of just re-reading notes, test yourself regularly. Close your books and try to recall key concepts from memory.",
      priority: "high",
      category: "study-technique",
      icon: <Brain className="h-4 w-4" />,
    })

    recs.push({
      id: "spaced-repetition",
      title: "Implement Spaced Repetition",
      description:
        "Review material at increasing intervals (1 day, 3 days, 1 week, 2 weeks) to improve long-term retention.",
      priority: "high",
      category: "study-technique",
      icon: <Clock className="h-4 w-4" />,
    })

    recs.push({
      id: "pomodoro",
      title: "Try the Pomodoro Technique",
      description:
        "Study in 25-minute focused sessions followed by 5-minute breaks. This helps maintain concentration and prevents burnout.",
      priority: "medium",
      category: "time-management",
      icon: <Target className="h-4 w-4" />,
    })

    // Subject-specific recommendations for weak subjects
    weakSubjects.forEach((subject) => {
      const daysUntilExam = getExamUrgency(subject.examDate)

      recs.push({
        id: `weak-${subject.name}`,
        title: `Focus on ${subject.name} Fundamentals`,
        description: `Your ${subject.name} score is ${subject.score}%. Start with basic concepts and gradually build complexity. Consider seeking additional help.`,
        priority: "high",
        category: "study-technique",
        subject: subject.name,
        icon: <AlertTriangle className="h-4 w-4" />,
      })

      if (daysUntilExam <= 14) {
        recs.push({
          id: `urgent-${subject.name}`,
          title: `Urgent: ${subject.name} Exam Preparation`,
          description: `Your ${subject.name} exam is in ${daysUntilExam} days. Focus on past papers and key topics that are likely to appear.`,
          priority: "high",
          category: "exam-prep",
          subject: subject.name,
          icon: <Calendar className="h-4 w-4" />,
        })
      }
    })

    // Subject-specific recommendations for average subjects
    averageSubjects.forEach((subject) => {
      recs.push({
        id: `average-${subject.name}`,
        title: `Strengthen ${subject.name} Performance`,
        description: `You're doing well in ${subject.name} (${subject.score}%). Focus on practice problems and challenging questions to reach excellence.`,
        priority: "medium",
        category: "study-technique",
        subject: subject.name,
        icon: <TrendingUp className="h-4 w-4" />,
      })
    })

    // Time management recommendations
    if (studentData.studyHoursPerDay < 3) {
      recs.push({
        id: "increase-study-time",
        title: "Consider Increasing Study Time",
        description: `You're currently studying ${studentData.studyHoursPerDay} hours per day. Consider gradually increasing to 4-5 hours for better results.`,
        priority: "medium",
        category: "time-management",
        icon: <Clock className="h-4 w-4" />,
      })
    }

    // Exam preparation recommendations
    const upcomingExams = subjects.filter((s) => getExamUrgency(s.examDate) <= 21)
    if (upcomingExams.length > 0) {
      recs.push({
        id: "mock-tests",
        title: "Take Regular Mock Tests",
        description:
          "Practice with timed mock tests to improve your exam technique and identify areas that need more work.",
        priority: "high",
        category: "exam-prep",
        icon: <FileText className="h-4 w-4" />,
      })

      recs.push({
        id: "exam-strategy",
        title: "Develop Exam Strategy",
        description:
          "Plan your approach for each exam: time allocation per question, which sections to tackle first, and how to manage stress.",
        priority: "medium",
        category: "exam-prep",
        icon: <Target className="h-4 w-4" />,
      })
    }

    // Motivation recommendations
    const overallAverage = subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length
    if (overallAverage < 70) {
      recs.push({
        id: "study-group",
        title: "Join or Form Study Groups",
        description: "Collaborate with classmates to discuss difficult concepts, share notes, and motivate each other.",
        priority: "medium",
        category: "motivation",
        icon: <Users className="h-4 w-4" />,
      })

      recs.push({
        id: "small-wins",
        title: "Celebrate Small Wins",
        description:
          "Set daily and weekly goals. Celebrate when you achieve them to maintain motivation and build momentum.",
        priority: "low",
        category: "motivation",
        icon: <Star className="h-4 w-4" />,
      })
    }

    // Additional study techniques
    recs.push({
      id: "mind-maps",
      title: "Create Visual Mind Maps",
      description: "Use mind maps to connect related concepts and improve understanding of complex topics.",
      priority: "low",
      category: "study-technique",
      icon: <Lightbulb className="h-4 w-4" />,
    })

    return recs
  }, [studentData])

  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === "all") return recommendations
    return recommendations.filter((rec) => rec.category === selectedCategory)
  }, [recommendations, selectedCategory])

  const categoryStats = useMemo(() => {
    const stats = {
      "study-technique": 0,
      "time-management": 0,
      "exam-prep": 0,
      motivation: 0,
    }

    recommendations.forEach((rec) => {
      stats[rec.category]++
    })

    return stats
  }, [recommendations])

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
    }
  }

  const getPriorityLabel = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "High Priority"
      case "medium":
        return "Medium Priority"
      case "low":
        return "Low Priority"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "study-technique":
        return <Brain className="h-4 w-4" />
      case "time-management":
        return <Clock className="h-4 w-4" />
      case "exam-prep":
        return <FileText className="h-4 w-4" />
      case "motivation":
        return <Zap className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "study-technique":
        return "Study Techniques"
      case "time-management":
        return "Time Management"
      case "exam-prep":
        return "Exam Preparation"
      case "motivation":
        return "Motivation"
      default:
        return "All"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Personalized Recommendations</h2>
        <p className="text-lg text-muted-foreground">
          AI-powered study tips and strategies tailored to your performance
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tips</p>
                <p className="text-2xl font-bold text-foreground">{recommendations.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-destructive">
                  {recommendations.filter((r) => r.priority === "high").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Study Techniques</p>
                <p className="text-2xl font-bold text-primary">{categoryStats["study-technique"]}</p>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exam Prep</p>
                <p className="text-2xl font-bold text-primary">{categoryStats["exam-prep"]}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            All ({recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="study-technique" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Study ({categoryStats["study-technique"]})
          </TabsTrigger>
          <TabsTrigger value="time-management" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time ({categoryStats["time-management"]})
          </TabsTrigger>
          <TabsTrigger value="exam-prep" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Exam ({categoryStats["exam-prep"]})
          </TabsTrigger>
          <TabsTrigger value="motivation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Motivation ({categoryStats["motivation"]})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {recommendation.icon}
                      <CardTitle className="text-lg leading-tight">{recommendation.title}</CardTitle>
                    </div>
                    <Badge variant={getPriorityColor(recommendation.priority)} className="shrink-0">
                      {getPriorityLabel(recommendation.priority)}
                    </Badge>
                  </div>
                  {recommendation.subject && (
                    <Badge variant="outline" className="w-fit">
                      {recommendation.subject}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.description}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    {getCategoryIcon(recommendation.category)}
                    <span className="text-xs text-muted-foreground">{getCategoryLabel(recommendation.category)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Success Message */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">You're on the right track!</h3>
              <p className="text-sm text-muted-foreground">
                Follow these personalized recommendations consistently, and you'll see improvement in your academic
                performance. Remember, small daily improvements lead to significant long-term results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-6">
        <Button variant="outline" onClick={onStartOver}>
          Analyze New Data
        </Button>
        <Button onClick={() => window.print()} variant="secondary">
          Print Recommendations
        </Button>
      </div>
    </div>
  )
}
