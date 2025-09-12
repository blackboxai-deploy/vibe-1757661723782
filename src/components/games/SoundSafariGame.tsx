'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Child {
  id: string
  name: string
  progress: any
}

interface GameProps {
  child: Child
  onGameEnd: (score: number, completed?: boolean) => void
  onExit: () => void
}

const animals = [
  { name: 'Alligator', letter: 'A', icon: '🐊', sound: 'A for Alligator' },
  { name: 'Bear', letter: 'B', icon: '🐻', sound: 'B for Bear' },
  { name: 'Cat', letter: 'C', icon: '🐱', sound: 'C for Cat' },
  { name: 'Dog', letter: 'D', icon: '🐕', sound: 'D for Dog' },
  { name: 'Elephant', letter: 'E', icon: '🐘', sound: 'E for Elephant' },
  { name: 'Fox', letter: 'F', icon: '🦊', sound: 'F for Fox' },
  { name: 'Giraffe', letter: 'G', icon: '🦒', sound: 'G for Giraffe' },
  { name: 'Horse', letter: 'H', icon: '🐴', sound: 'H for Horse' },
]

export default function SoundSafariGame({ child, onGameEnd, onExit }: GameProps) {
  const [currentAnimal, setCurrentAnimal] = useState<typeof animals[0] | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [questionNum, setQuestionNum] = useState(1)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    startNewQuestion()
  }, [])

  const startNewQuestion = () => {
    const animal = animals[Math.floor(Math.random() * animals.length)]
    setCurrentAnimal(animal)
    
    const wrongOptions = animals
      .filter(a => a.letter !== animal.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(a => a.letter)
    
    const allOptions = [animal.letter, ...wrongOptions].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
    setFeedback('')
  }

  const handleAnswer = (selectedLetter: string) => {
    if (!currentAnimal) return

    if (selectedLetter === currentAnimal.letter) {
      setScore(prev => prev + 10)
      setFeedback('🎉 Correct!')
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Great! ${currentAnimal.sound}`)
        speechSynthesis.speak(utterance)
      }
    } else {
      setFeedback('❌ Try again!')
    }

    setTimeout(() => {
      if (questionNum >= 10) {
        onGameEnd(score, true)
      } else {
        setQuestionNum(prev => prev + 1)
        startNewQuestion()
      }
    }, 2000)
  }

  const playAnimalSound = () => {
    if (currentAnimal && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentAnimal.sound)
      speechSynthesis.speak(utterance)
    }
  }

  if (!currentAnimal) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-orange-800">
                  🦁 Sound Safari
                </CardTitle>
                <p className="text-gray-600">Listen and find the correct letter!</p>
              </div>
              <Button onClick={onExit} variant="outline">Exit</Button>
            </div>
          </CardHeader>
        </Card>

        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{currentAnimal.icon}</div>
          <Button 
            onClick={playAnimalSound}
            className="mb-4 bg-orange-500 hover:bg-orange-600"
          >
            🔊 Play Sound
          </Button>
          <p className="text-lg">What letter does this animal's name start with?</p>
        </div>

        {feedback && (
          <div className="text-center mb-4 text-2xl font-bold">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {options.map((letter) => (
            <Button
              key={letter}
              onClick={() => handleAnswer(letter)}
              className="h-20 text-2xl font-bold"
              variant="outline"
            >
              {letter}
            </Button>
          ))}
        </div>

        <div className="text-center mt-6">
          <p>Question {questionNum}/10 | Score: {score}</p>
        </div>
      </div>
    </div>
  )
}