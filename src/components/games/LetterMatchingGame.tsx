'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface Child {
  id: string
  name: string
  age: number
  avatar: string
  progress: any
}

interface GameProps {
  child: Child
  onGameEnd: (score: number, completed?: boolean) => void
  onExit: () => void
}

const letterPairs = [
  { letter: 'A', icon: '🍎', word: 'Apple' },
  { letter: 'B', icon: '📚', word: 'Book' },
  { letter: 'C', icon: '🐱', word: 'Cat' },
  { letter: 'D', icon: '🐕', word: 'Dog' },
  { letter: 'E', icon: '🥚', word: 'Egg' },
  { letter: 'F', icon: '🐟', word: 'Fish' },
  { letter: 'G', icon: '🍇', word: 'Grape' },
  { letter: 'H', icon: '🏠', word: 'House' },
  { letter: 'I', icon: '🍦', word: 'Ice cream' },
  { letter: 'J', icon: '🧃', word: 'Juice' }
]

export default function LetterMatchingGame({ child, onGameEnd, onExit }: GameProps) {
  const [gameLevel, setGameLevel] = useState(1)
  const [currentPairs, setCurrentPairs] = useState<typeof letterPairs>([])
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [feedback, setFeedback] = useState<string>('')

  // Initialize game
  useEffect(() => {
    startNewLevel()
  }, [])

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGameActive) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameActive])

  const startNewLevel = () => {
    const pairsCount = Math.min(3 + gameLevel, 6) // Start with 4 pairs, max 6
    const selectedPairs = letterPairs.slice(0, pairsCount)
    setCurrentPairs(selectedPairs)
    setMatchedPairs([])
    setSelectedLetter(null)
    setSelectedWord(null)
    setIsGameActive(true)
    setFeedback('')
  }

  const selectLetter = (letter: string) => {
    if (matchedPairs.includes(letter)) return
    
    setSelectedLetter(letter)
    if (selectedWord) {
      checkMatch(letter, selectedWord)
    }
  }

  const selectWord = (word: string, letter: string) => {
    if (matchedPairs.includes(letter)) return
    
    setSelectedWord(word)
    if (selectedLetter) {
      checkMatch(selectedLetter, word)
    }
  }

  const checkMatch = (letter: string, word: string) => {
    setAttempts(prev => prev + 1)
    
    const pair = currentPairs.find(p => p.letter === letter)
    if (pair && pair.word === word) {
      // Correct match
      setMatchedPairs(prev => [...prev, letter])
      setScore(prev => prev + 10)
      setFeedback('🎉 Great match!')
      
      // Play success sound
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Great! ${letter} for ${word}`)
        speechSynthesis.speak(utterance)
      }
      
      // Check if level complete
      if (matchedPairs.length + 1 >= currentPairs.length) {
        setTimeout(() => {
          if (gameLevel >= 3) {
            // Game complete
            completeGame()
          } else {
            // Next level
            setGameLevel(prev => prev + 1)
            setScore(prev => prev + 20) // Level bonus
            setFeedback('🌟 Level Complete! Moving to next level...')
            setTimeout(() => {
              startNewLevel()
            }, 2000)
          }
        }, 1000)
      }
    } else {
      // Wrong match
      setFeedback('❌ Try again!')
      setTimeout(() => setFeedback(''), 1500)
    }
    
    setSelectedLetter(null)
    setSelectedWord(null)
  }

  const completeGame = () => {
    setIsGameActive(false)
    const accuracy = Math.round((matchedPairs.length / attempts) * 100)
    const timeBonus = Math.max(0, 300 - gameTime) // Bonus for completing under 5 minutes
    const finalScore = score + timeBonus + accuracy
    
    setScore(finalScore)
    setFeedback('🏆 Game Complete! Well done!')
    
    setTimeout(() => {
      onGameEnd(finalScore, true)
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (matchedPairs.length / currentPairs.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-blue-800">
                  🔤 Letter Matching Game
                </CardTitle>
                <p className="text-gray-600">
                  Match letters with their corresponding words, {child.name}!
                </p>
              </div>
              <Button onClick={onExit} variant="outline">
                Exit Game
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{gameLevel}</div>
              <div className="text-sm text-gray-600">Level</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(gameTime)}</div>
              <div className="text-sm text-gray-600">Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{matchedPairs.length}/{currentPairs.length}</div>
              <div className="text-sm text-gray-600">Matches</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Level Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Feedback */}
        {feedback && (
          <div className="text-center mb-4">
            <div className="inline-block px-6 py-3 bg-white rounded-full shadow-lg text-lg font-semibold">
              {feedback}
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Letters Column */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">Letters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {currentPairs.map((pair) => (
                  <button
                    key={`letter-${pair.letter}`}
                    onClick={() => selectLetter(pair.letter)}
                    disabled={matchedPairs.includes(pair.letter)}
                    className={`
                      p-6 rounded-xl border-2 transition-all duration-300 font-bold text-2xl
                      ${matchedPairs.includes(pair.letter) 
                        ? 'bg-green-100 border-green-300 text-green-700 cursor-not-allowed' 
                        : selectedLetter === pair.letter
                        ? 'bg-blue-100 border-blue-400 text-blue-700 scale-105'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:scale-95'
                      }
                    `}
                  >
                    {matchedPairs.includes(pair.letter) ? '✅' : pair.letter}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Words Column */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {currentPairs.map((pair) => (
                  <button
                    key={`word-${pair.word}`}
                    onClick={() => selectWord(pair.word, pair.letter)}
                    disabled={matchedPairs.includes(pair.letter)}
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3
                      ${matchedPairs.includes(pair.letter) 
                        ? 'bg-green-100 border-green-300 text-green-700 cursor-not-allowed' 
                        : selectedWord === pair.word
                        ? 'bg-blue-100 border-blue-400 text-blue-700 scale-105'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:scale-95'
                      }
                    `}
                  >
                    <span className="text-2xl">{pair.icon}</span>
                    <span className="font-semibold text-lg">
                      {matchedPairs.includes(pair.letter) ? '✅ ' : ''}{pair.word}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="p-4 text-center">
            <p className="text-gray-600">
              Click on a letter, then click on its matching word. Complete all matches to advance!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}