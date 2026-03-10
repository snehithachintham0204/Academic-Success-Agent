"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Calendar, BookOpen, Clock } from "lucide-react"
import type { StudentData, Subject } from "@/app/page"

interface StudentDataFormProps {
  onSubmit: (data: StudentData) => void
}

export function StudentDataForm({ onSubmit }: StudentDataFormProps) {
  const [subjects, setSubjects] = useState<Omit<Subject, "category">[]>([{ name: "", score: 0, examDate: "" }])
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(4)

  const addSubject = () => {
    setSubjects([...subjects, { name: "", score: 0, examDate: "" }])
  }

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index))
    }
  }

  const updateSubject = (index: number, field: keyof Omit<Subject, "category">, value: string | number) => {
    const updated = subjects.map((subject, i) => (i === index ? { ...subject, [field]: value } : subject))
    setSubjects(updated)
  }

  const categorizeSubject = (score: number): "weak" | "average" | "strong" => {
    if (score < 60) return "weak"
    if (score < 80) return "average"
    return "strong"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validSubjects = subjects.filter((s) => s.name.trim() && s.score >= 0 && s.examDate)
    if (validSubjects.length === 0) {
      alert("Please add at least one valid subject with name, score, and exam date.")
      return
    }

    // Add categories to subjects
    const categorizedSubjects: Subject[] = validSubjects.map((subject) => ({
      ...subject,
      category: categorizeSubject(subject.score),
    }))

    const studentData: StudentData = {
      subjects: categorizedSubjects,
      studyHoursPerDay,
    }

    onSubmit(studentData)
  }

  const isFormValid = subjects.some((s) => s.name.trim() && s.score >= 0 && s.examDate) && studyHoursPerDay > 0

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <BookOpen className="h-6 w-6 text-primary" />
          Student Information
        </CardTitle>
        <CardDescription>Enter your subjects, current scores (0-100), and upcoming exam dates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Study Hours Per Day */}
          <div className="space-y-2">
            <Label htmlFor="studyHours" className="flex items-center gap-2 text-base font-medium">
              <Clock className="h-4 w-4 text-primary" />
              Daily Study Hours Available
            </Label>
            <Input
              id="studyHours"
              type="number"
              min="1"
              max="16"
              value={studyHoursPerDay}
              onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">How many hours can you dedicate to studying each day?</p>
          </div>

          {/* Subjects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Subjects & Scores</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubject}
                className="flex items-center gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
            </div>

            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <Card key={index} className="p-4 bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor={`subject-${index}`} className="text-sm font-medium">
                        Subject Name
                      </Label>
                      <Input
                        id={`subject-${index}`}
                        placeholder="e.g., Mathematics"
                        value={subject.name}
                        onChange={(e) => updateSubject(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`score-${index}`} className="text-sm font-medium">
                        Current Score (%)
                      </Label>
                      <Input
                        id={`score-${index}`}
                        type="number"
                        min="0"
                        max="100"
                        placeholder="85"
                        value={subject.score || ""}
                        onChange={(e) => updateSubject(index, "score", Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`exam-${index}`} className="flex items-center gap-1 text-sm font-medium">
                        <Calendar className="h-3 w-3" />
                        Exam Date
                      </Label>
                      <Input
                        id={`exam-${index}`}
                        type="date"
                        value={subject.examDate}
                        onChange={(e) => updateSubject(index, "examDate", e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {subject.score > 0 && (
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subject.score < 60
                              ? "bg-destructive/10 text-destructive"
                              : subject.score < 80
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-primary/10 text-primary"
                          }`}
                        >
                          {subject.score < 60 ? "Weak" : subject.score < 80 ? "Average" : "Strong"}
                        </div>
                      )}
                      {subjects.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubject(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Performance Legend */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Performance Categories:</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span>Weak (0-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Average (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>Strong (80-100%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button type="submit" size="lg" disabled={!isFormValid} className="px-8">
              Analyze My Performance
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
