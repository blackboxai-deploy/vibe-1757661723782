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

const adventures = [
  { number: 1, icon: '1️⃣', challenge: 'Find 1 treasure chest!', items: ['💰'] },
  { number: 2, icon: '2️⃣', challenge: 'Collect 2 gems!', items: ['💎', '💎'] },
  { number: 3, icon: '3️⃣', challenge: 'Gather 3 flowers!', items: ['🌸', '🌸', '🌸'] },
  { number: 4, icon: '4️⃣', challenge: 'Find 4 stars!', items: ['⭐', '⭐', '⭐', '⭐'] },
  { number: 5, icon: '5️⃣', challenge: 'Count 5 coins!', items: ['🪙', '🪙', '🪙', '🪙', '🪙'] },
]

export default function NumberAdventureGame({ child, onGameEnd, onExit }: GameProps) {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [collectedItems, setCollectedItems] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')

  const adventure = adventures[currentLevel]

  const collectItem = () => {
    if (collectedItems.length < adventure.number) {
      setCollectedItems(prev => [...prev, adventure.items[prev.length]])
      
      if (collectedItems.length + 1 === adventure.number) {
        setScore(prev => prev + 20)
        setFeedback('🎉 Adventure Complete!')
        
        setTimeout(() => {
          if (currentLevel >= adventures.length - 1) {
            onGameEnd(score + 20, true)
          } else {
            setCurrentLevel(prev => prev + 1)
            setCollectedItems([])
            setFeedback('')
          }
        }, 2000)
      }
    }
  }

  if (!adventure) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-purple-800">
                🔢 Number Adventure
              </CardTitle>
              <Button onClick={onExit} variant="outline">Exit</Button>
            </div>
          </CardHeader>
        </Card>

        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{adventure.icon}</div>
          <h2 className="text-2xl font-bold mb-4">{adventure.challenge}</h2>
          
          <div className="flex justify-center space-x-2 mb-6">
            {adventure.items.map((item, index) => (
              <div 
                key={index}
                className={`text-4xl p-2 border-2 rounded-lg ${
                  index < collectedItems.length 
                    ? 'border-green-400 bg-green-100' 
                    : 'border-gray-300 bg-gray-100'
                }`}
              >
                {index < collectedItems.length ? item : '❓'}
              </div>
            ))}
          </div>

          <Button
            onClick={collectItem}
            disabled={collectedItems.length >= adventure.number}
            className="mb-4 bg-purple-500 hover:bg-purple-600 text-lg px-8 py-4"
          >
            Collect Item ({collectedItems.length}/{adventure.number})
          </Button>

          {feedback && (
            <div className="text-2xl font-bold text-green-600 mb-4">
              {feedback}
            </div>
          )}

          <p className="text-lg">Level: {currentLevel + 1}/{adventures.length} | Score: {score}</p>
        </div>
      </div>
    </div>
  )
}