'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface GameProps {
  child: any
  onGameEnd: (score: number, completed?: boolean) => void
  onExit: () => void
}

const sentences = [
  { text: "The cat is big.", question: "What is big?", answer: "cat", options: ["cat", "dog", "car"] },
  { text: "I see a red ball.", question: "What color is the ball?", answer: "red", options: ["red", "blue", "green"] },
  { text: "The dog runs fast.", question: "What does the dog do?", answer: "runs", options: ["runs", "sleeps", "sits"] },
]

export default function ReadingRaceGame({ onGameEnd, onExit }: GameProps) {
  const [currentSentence, setCurrentSentence] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [showQuestion, setShowQuestion] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (showQuestion) {
            // Move to next or end game
            if (currentSentence >= sentences.length - 1) {
              onGameEnd(score, true)
            } else {
              setCurrentSentence(prev => prev + 1)
              setShowQuestion(false)
              return 30
            }
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showQuestion, currentSentence, score, onGameEnd])

  const sentence = sentences[currentSentence]

  const finishReading = () => {
    setShowQuestion(true)
  }

  const handleAnswer = (answer: string) => {
    if (answer === sentence.answer) {
      const timeBonus = timeLeft * 2
      setScore(prev => prev + 10 + timeBonus)
      setFeedback('🎉 Correct!')
    } else {
      setFeedback('❌ Wrong answer')
    }

    setTimeout(() => {
      if (currentSentence >= sentences.length - 1) {
        onGameEnd(score, true)
      } else {
        setCurrentSentence(prev => prev + 1)
        setShowQuestion(false)
        setTimeLeft(30)
        setFeedback('')
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">🏁 Reading Race</CardTitle>
              <Button onClick={onExit} variant="outline">Exit</Button>
            </div>
          </CardHeader>
        </Card>

        <div className="text-center">
          <div className="text-4xl font-bold mb-4">Time: {timeLeft}s</div>
          
          {!showQuestion ? (
            <div>
              <h2 className="text-2xl mb-6">Read this sentence quickly:</h2>
              <div className="text-3xl font-bold p-8 bg-white rounded-lg shadow-lg mb-6">
                {sentence.text}
              </div>
              <Button 
                onClick={finishReading}
                className="bg-red-500 hover:bg-red-600 text-xl px-8 py-4"
              >
                Done Reading!
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl mb-6">{sentence.question}</h2>
              
              {feedback && <div className="text-2xl font-bold mb-4">{feedback}</div>}
              
              <div className="flex justify-center space-x-4">
                {sentence.options.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className="text-lg p-6"
                    variant="outline"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6">Sentence {currentSentence + 1}/{sentences.length} | Score: {score}</p>
        </div>
      </div>
    </div>
  )
}