'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface GameProps {
  child: any
  onGameEnd: (score: number, completed?: boolean) => void
  onExit: () => void
}

const patterns = [
  { sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟡'] },
  { sequence: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙', options: ['⭐', '🌙', '☀️'] },
  { sequence: ['A', 'B', 'A', 'B'], answer: 'A', options: ['A', 'B', 'C'] },
]

export default function PatternPuzzleGame({ onGameEnd, onExit }: GameProps) {
  const [currentPattern, setCurrentPattern] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')

  const pattern = patterns[currentPattern]

  const handleAnswer = (answer: string) => {
    if (answer === pattern.answer) {
      setScore(prev => prev + 15)
      setFeedback('🎉 Correct!')
      
      setTimeout(() => {
        if (currentPattern >= patterns.length - 1) {
          onGameEnd(score + 15, true)
        } else {
          setCurrentPattern(prev => prev + 1)
          setFeedback('')
        }
      }, 2000)
    } else {
      setFeedback('❌ Try again!')
      setTimeout(() => setFeedback(''), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">🧩 Pattern Puzzle</CardTitle>
              <Button onClick={onExit} variant="outline">Exit</Button>
            </div>
          </CardHeader>
        </Card>

        <div className="text-center">
          <h2 className="text-xl mb-6">What comes next in this pattern?</h2>
          
          <div className="flex justify-center space-x-4 mb-6">
            {pattern.sequence.map((item, index) => (
              <div key={index} className="text-4xl p-4 border-2 rounded-lg bg-white">
                {item}
              </div>
            ))}
            <div className="text-4xl p-4 border-2 border-dashed rounded-lg bg-gray-100">
              ❓
            </div>
          </div>

          {feedback && <div className="text-2xl font-bold mb-4">{feedback}</div>}

          <div className="flex justify-center space-x-4">
            {pattern.options.map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                className="text-2xl p-8"
                variant="outline"
              >
                {option}
              </Button>
            ))}
          </div>

          <p className="mt-6">Question {currentPattern + 1}/{patterns.length} | Score: {score}</p>
        </div>
      </div>
    </div>
  )
}