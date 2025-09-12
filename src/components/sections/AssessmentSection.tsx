'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface Child {
  id: string
  name: string
  progress: any
}

interface AssessmentProps {
  child: Child | null
  onProgressUpdate: (childId: string, update: any) => void
}

const assessmentQuestions = [
  {
    question: "Which letter is this?",
    type: "letter-recognition",
    options: ["A", "B", "C", "D"],
    answer: "A",
    icon: "A"
  },
  {
    question: "Select the word that starts with 'B'",
    type: "word-recognition", 
    options: ["Cat", "Ball", "Dog", "Egg"],
    answer: "Ball",
    icon: "🏀"
  },
  {
    question: "Which number comes after 5?",
    type: "number-sequence",
    options: ["4", "6", "7", "8"],
    answer: "6",
    icon: "5️⃣➡️❓"
  },
  {
    question: "Select the correct spelling",
    type: "spelling",
    options: ["Aple", "Apple", "Appl", "Appel"],
    answer: "Apple",
    icon: "🍎"
  },
  {
    question: "What sound does 'M' make?",
    type: "phonics",
    options: ["mmm", "nnn", "bbb", "sss"],
    answer: "mmm",
    icon: "🎵"
  }
]

export default function AssessmentSection({ child, onProgressUpdate }: AssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())

  if (!child) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a child to start assessment
        </h2>
      </div>
    )
  }

  const currentQuestion = assessmentQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
  }

  const handleNext = async () => {
    if (!selectedOption) return

    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = selectedOption
    setUserAnswers(newAnswers)
    setSelectedOption('')

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      await completeAssessment(newAnswers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedOption(userAnswers[currentQuestionIndex - 1] || '')
    }
  }

  const completeAssessment = async (answers: string[]) => {
    let correctCount = 0
    assessmentQuestions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctCount++
      }
    })

    const finalScore = Math.round((correctCount / assessmentQuestions.length) * 100)
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    
    setScore(finalScore)
    setAssessmentComplete(true)

    // Submit assessment to API
    try {
      await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: child.id,
          type: 'comprehensive',
          score: finalScore,
          totalQuestions: assessmentQuestions.length,
          correctAnswers: correctCount,
          timeSpent,
          answers
        }),
      })

      // Update progress
      await onProgressUpdate(child.id, {
        assessmentScores: [...child.progress.assessmentScores, finalScore]
      })
    } catch (error) {
      console.error('Assessment submission error:', error)
    }
  }

  const resetAssessment = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedOption('')
    setAssessmentComplete(false)
    setScore(0)
  }

  if (assessmentComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white">🎉</span>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Assessment Complete!
            </CardTitle>
            <p className="text-lg text-gray-600">
              Great job, {child.name}!
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {score}%
              </div>
              <p className="text-xl text-gray-600">Final Score</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-inner">
              <h3 className="font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions Answered:</span>
                  <span className="font-semibold">{assessmentQuestions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Correct Answers:</span>
                  <span className="font-semibold text-green-600">
                    {Math.round((score / 100) * assessmentQuestions.length)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className={`font-semibold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {score}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={resetAssessment}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Take Again
              </Button>
              <Button variant="outline">
                View Detailed Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Dyslexia Assessment
              </CardTitle>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Question */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="text-center mb-4">
              <div className="text-6xl mb-4">{currentQuestion.icon}</div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              {currentQuestion.question}
            </h2>
            
            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`
                    p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium
                    ${selectedOption === option
                      ? 'border-blue-500 bg-blue-100 text-blue-900'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedOption === option ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                    `}>
                      {selectedOption === option && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={!selectedOption}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {currentQuestionIndex === assessmentQuestions.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}