"use client"

import { useState } from "react"
import { StudentDataForm } from "@/components/student-data-form"
import { PerformanceAnalysis } from "@/components/performance-analysis"
import { StudySchedule } from "@/components/study-schedule"
import { RecommendationsDashboard } from "@/components/recommendations-dashboard"

export interface Subject {
  name: string
  score: number
  examDate: string
  category: "weak" | "average" | "strong"
}

export interface StudentData {
  subjects: Subject[]
  studyHoursPerDay: number
}

export default function AcademicSuccessCoach() {
  const [currentStep, setCurrentStep] = useState<"input" | "analysis" | "schedule" | "recommendations">("input")
  const [studentData, setStudentData] = useState<StudentData | null>(null)

  const handleDataSubmit = (data: StudentData) => {
    setStudentData(data)
    setCurrentStep("analysis")
  }

  const handleContinueToSchedule = () => {
    setCurrentStep("schedule")
  }

  const handleContinueToRecommendations = () => {
    setCurrentStep("recommendations")
  }

  const handleStartOver = () => {
    setCurrentStep("input")
    setStudentData(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">
              🎓
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Academic Success Coach</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">AI-powered study planning</p>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-muted/30 overflow-x-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 sm:gap-8 min-w-min sm:min-w-0">
            {[
              { step: "input", number: "1", label: "Input" },
              { step: "analysis", number: "2", label: "Analysis" },
              { step: "schedule", number: "3", label: "Schedule" },
              { step: "recommendations", number: "4", label: "Tips" },
            ].map((item) => (
              <div
                key={item.step}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  currentStep === item.step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full flex-shrink-0 text-xs sm:text-sm font-medium ${
                    currentStep === item.step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.number}
                </div>
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === "input" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                Let's Analyze Your Academic Performance
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Enter your subject scores and exam dates to get personalized study recommendations
              </p>
            </div>
            <StudentDataForm onSubmit={handleDataSubmit} />
          </div>
        )}

        {currentStep === "analysis" && studentData && (
          <div className="max-w-4xl mx-auto">
            <PerformanceAnalysis
              studentData={studentData}
              onContinue={handleContinueToSchedule}
              onStartOver={handleStartOver}
            />
          </div>
        )}

        {currentStep === "schedule" && studentData && (
          <div className="max-w-6xl mx-auto">
            <StudySchedule
              studentData={studentData}
              onContinue={handleContinueToRecommendations}
              onStartOver={handleStartOver}
            />
          </div>
        )}

        {currentStep === "recommendations" && studentData && (
          <div className="max-w-4xl mx-auto">
            <RecommendationsDashboard studentData={studentData} onStartOver={handleStartOver} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Academic Success Coach - Empowering students to achieve their goals
            </p>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
              <span>📊 Data-Driven</span>
              <span>🎯 Goal-Oriented</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
