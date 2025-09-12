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

const words = [
  { word: 'CAT', icon: '🐱', hint: 'A furry pet that says meow' },
  { word: 'DOG', icon: '🐕', hint: 'A loyal pet that barks' },
  { word: 'SUN', icon: '☀️', hint: 'It shines bright in the sky' },
  { word: 'BAG', icon: '👜', hint: 'You carry things in this' },
  { word: 'EGG', icon: '🥚', hint: 'Chickens lay these' },
  { word: 'FUN', icon: '🎉', hint: 'When you enjoy something' },
  { word: 'HAT', icon: '👒', hint: 'You wear this on your head' },
  { word: 'ICE', icon: '🧊', hint: 'Frozen water' },
  { word: 'JAR', icon: '🏺', hint: 'A container for storing things' },
  { word: 'KEY', icon: '🔑', hint: 'Opens locks and doors' },
  { word: 'LOG', icon: '🪵', hint: 'A piece of wood' },
  { word: 'MAP', icon: '🗺️', hint: 'Shows you where to go' },
  { word: 'NET', icon: '🥅', hint: 'Used to catch things' },
  { word: 'OWL', icon: '🦉', hint: 'A wise night bird' },
  { word: 'PIG', icon: '🐷', hint: 'A pink farm animal' }
]

export default function WordBuilderGame({ child, onGameEnd, onExit }: GameProps) {
  const [currentWord, setCurrentWord] = useState<typeof words[0] | null>(null)
  const [availableLetters, setAvailableLetters] = useState<string[]>([])
  const [builtWord, setBuiltWord] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)

  // Initialize game
  useEffect(() => {
    startNewWord()
  }, [])

  // Game timer
  useEffect(() => {
    let interval: any
    if (isGameActive) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameActive])

  const startNewWord = () => {
    const availableWords = words.filter(w => w.word.length <= 3 + Math.floor(level / 2)) // Progressive difficulty
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)]
    
    setCurrentWord(randomWord)
    setBuiltWord([])
    setShowHint(false)
    
    // Create scrambled letters
    const wordLetters = randomWord.word.split('')
    const extraLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
      .filter(letter => !wordLetters.includes(letter))
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(4, 7 - wordLetters.length))
    
    const allLetters = [...wordLetters, ...extraLetters].sort(() => Math.random() - 0.5)
    setAvailableLetters(allLetters)
    setIsGameActive(true)
  }

  const addLetter = (letter: string, index: number) => {
    if (builtWord.length < currentWord!.word.length) {
      setBuiltWord(prev => [...prev, letter])
      setAvailableLetters(prev => prev.filter((_, i) => i !== index))
    }
  }

  const removeLetter = (index: number) => {
    const letter = builtWord[index]
    setBuiltWord(prev => prev.filter((_, i) => i !== index))
    setAvailableLetters(prev => [...prev, letter])
  }

  const checkWord = () => {
    if (builtWord.join('') === currentWord!.word) {
      // Correct word
      const baseScore = 20
      const hintPenalty = hintsUsed * 5
      const timeBonus = Math.max(0, 30 - gameTime) // Bonus for speed
      const wordScore = Math.max(5, baseScore - hintPenalty + timeBonus)
      
      setScore(prev => prev + wordScore)
      setWordsCompleted(prev => prev + 1)
      setFeedback(`🎉 Excellent! "${currentWord!.word}" is correct! +${wordScore} points`)
      
      // Play success sound
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Perfect! ${currentWord!.word}`)
        speechSynthesis.speak(utterance)
      }
      
      // Check level progression
      if (wordsCompleted + 1 >= 3 + level) {
        setLevel(prev => prev + 1)
        setScore(prev => prev + 50) // Level bonus
        setFeedback(prev => prev + ' 🌟 Level Up!')
      }
      
      // Check game completion
      if (wordsCompleted + 1 >= 15) {
        setTimeout(() => {
          completeGame()
        }, 2000)
      } else {
        setTimeout(() => {
          startNewWord()
          setFeedback('')
          setHintsUsed(0)
        }, 2000)
      }
    } else {
      // Wrong word
      setFeedback('❌ Not quite right. Try again!')
      setTimeout(() => setFeedback(''), 1500)
    }
  }

  const useHint = () => {
    setShowHint(true)
    setHintsUsed(prev => prev + 1)
  }

  const completeGame = () => {
    setIsGameActive(false)
    const finalScore = score + Math.max(0, 600 - gameTime) // Time bonus
    setScore(finalScore)
    setFeedback('🏆 Game Complete! You\'re a Word Building Master!')
    
    setTimeout(() => {
      onGameEnd(finalScore, true)
    }, 2000)
  }

  const shuffleLetters = () => {
    setAvailableLetters(prev => [...prev].sort(() => Math.random() - 0.5))
  }

  const clearWord = () => {
    setAvailableLetters(prev => [...prev, ...builtWord])
    setBuiltWord([])
  }

  if (!currentWord) return <div>Loading...</div>

  const progress = (wordsCompleted / 15) * 100
  const isWordComplete = builtWord.length === currentWord.word.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-green-800">
                  🏗️ Word Builder
                </CardTitle>
                <p className="text-gray-600">
                  Build words using the letters below, {child.name}!
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
              <div className="text-2xl font-bold text-green-600">{level}</div>
              <div className="text-sm text-gray-600">Level</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{wordsCompleted}/15</div>
              <div className="text-sm text-gray-600">Words</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</div>
              <div className="text-sm text-gray-600">Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Game Progress</span>
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

        {/* Word Icon and Target */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">{currentWord.icon}</div>
            <div className="text-lg text-gray-600 mb-4">
              Build this {currentWord.word.length}-letter word:
            </div>
            {showHint && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
                <span className="text-yellow-800">💡 Hint: {currentWord.hint}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Word Building Area */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-4">Your Word:</h3>
              <div className="flex justify-center space-x-2 mb-6">
                {Array.from({ length: currentWord.word.length }).map((_, index) => (
                  <div
                    key={index}
                    onClick={() => builtWord[index] && removeLetter(index)}
                    className={`
                      w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold
                      ${builtWord[index] 
                        ? 'bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200' 
                        : 'bg-gray-50'
                      }
                    `}
                  >
                    {builtWord[index] || '?'}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center space-x-4 mb-4">
                <Button
                  onClick={checkWord}
                  disabled={!isWordComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Check Word
                </Button>
                <Button onClick={clearWord} variant="outline">
                  Clear
                </Button>
                <Button 
                  onClick={useHint} 
                  variant="outline"
                  disabled={showHint}
                >
                  💡 Hint
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Letters */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Available Letters:</h3>
                <Button onClick={shuffleLetters} variant="outline" size="sm">
                  🔄 Shuffle
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {availableLetters.map((letter, index) => (
                  <button
                    key={`${letter}-${index}`}
                    onClick={() => addLetter(letter, index)}
                    className="w-12 h-12 bg-white border-2 border-blue-300 rounded-lg text-xl font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 active:scale-95"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}