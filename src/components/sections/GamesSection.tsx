'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LetterMatchingGame from '@/components/games/LetterMatchingGame'
import WordBuilderGame from '@/components/games/WordBuilderGame'
import SoundSafariGame from '@/components/games/SoundSafariGame'
import NumberAdventureGame from '@/components/games/NumberAdventureGame'
import PatternPuzzleGame from '@/components/games/PatternPuzzleGame'
import ReadingRaceGame from '@/components/games/ReadingRaceGame'

interface Child {
  id: string
  name: string
  age: number
  avatar: string
  progress: {
    overallProgress: number
    lettersMastered: number
    numbersCompleted: number
    gamesPlayed: number
    assessmentScores: number[]
  }
}

interface GamesProps {
  child: Child | null
  onProgressUpdate: (childId: string, update: any) => void
}

const educationalGames = [
  {
    id: 'letter-matching',
    title: 'Letter Matching',
    description: 'Match letters with corresponding images and words',
    icon: '🔤',
    difficulty: 'Easy',
    duration: '5-10 min',
    category: 'Alphabet',
    color: 'from-blue-500 to-cyan-500',
    skills: ['Letter Recognition', 'Visual Memory']
  },
  {
    id: 'word-builder',
    title: 'Word Builder',
    description: 'Build words by arranging letters in correct order',
    icon: '🏗️',
    difficulty: 'Medium',
    duration: '10-15 min',
    category: 'Spelling',
    color: 'from-green-500 to-emerald-500',
    skills: ['Spelling', 'Word Formation']
  },
  {
    id: 'sound-safari',
    title: 'Sound Safari',
    description: 'Identify animals by their starting letter sounds',
    icon: '🦁',
    difficulty: 'Easy',
    duration: '8-12 min',
    category: 'Phonics',
    color: 'from-yellow-500 to-orange-500',
    skills: ['Phonics', 'Sound Recognition']
  },
  {
    id: 'number-adventure',
    title: 'Number Adventure',
    description: 'Go on a quest while learning numbers 1-10',
    icon: '🔢',
    difficulty: 'Easy',
    duration: '10-15 min',
    category: 'Numbers',
    color: 'from-purple-500 to-pink-500',
    skills: ['Number Recognition', 'Counting']
  },
  {
    id: 'pattern-puzzle',
    title: 'Pattern Puzzle',
    description: 'Complete visual and letter patterns',
    icon: '🧩',
    difficulty: 'Hard',
    duration: '15-20 min',
    category: 'Logic',
    color: 'from-indigo-500 to-purple-500',
    skills: ['Pattern Recognition', 'Logic']
  },
  {
    id: 'reading-race',
    title: 'Reading Race',
    description: 'Race against time to read simple sentences',
    icon: '🏁',
    difficulty: 'Medium',
    duration: '5-8 min',
    category: 'Reading',
    color: 'from-red-500 to-pink-500',
    skills: ['Reading Speed', 'Comprehension']
  }
]

export default function GamesSection({ child, onProgressUpdate }: GamesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  if (!child) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a child to play educational games
        </h2>
      </div>
    )
  }

  const categories = ['All', ...Array.from(new Set(educationalGames.map(game => game.category)))]
  
  const filteredGames = selectedCategory === 'All' 
    ? educationalGames 
    : educationalGames.filter(game => game.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const startGame = async (gameId: string) => {
    setActiveGame(gameId)
    setGameStartTime(Date.now())

    // Log game start
    await fetch('/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        childId: child.id,
        gameId,
        gameName: educationalGames.find(g => g.id === gameId)?.title || 'Unknown Game',
        completed: false,
        duration: 0
      }),
    })
  }

  const endGame = async (gameId: string, score: number, completed: boolean = true) => {
    const duration = Math.floor((Date.now() - gameStartTime) / 1000)
    
    // Update game session
    await fetch('/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        childId: child.id,
        gameId,
        gameName: educationalGames.find(g => g.id === gameId)?.title || 'Unknown Game',
        score,
        duration,
        completed,
        data: { finalScore: score, timeSpent: duration }
      }),
    })

    // Update progress
    await onProgressUpdate(child.id, {
      gamesPlayed: child.progress.gamesPlayed + 1,
      activityType: 'GAME',
      activityName: educationalGames.find(g => g.id === gameId)?.title || 'Game',
      duration,
      score
    })

    setActiveGame(null)
    setGameStartTime(0)
  }

  const renderGame = () => {
    if (!activeGame) return null

    const gameProps = {
      child,
      onGameEnd: (score: number, completed: boolean = true) => endGame(activeGame, score, completed),
      onExit: () => {
        endGame(activeGame, 0, false)
      }
    }

    switch (activeGame) {
      case 'letter-matching':
        return <LetterMatchingGame {...gameProps} />
      case 'word-builder':
        return <WordBuilderGame {...gameProps} />
      case 'sound-safari':
        return <SoundSafariGame {...gameProps} />
      case 'number-adventure':
        return <NumberAdventureGame {...gameProps} />
      case 'pattern-puzzle':
        return <PatternPuzzleGame {...gameProps} />
      case 'reading-race':
        return <ReadingRaceGame {...gameProps} />
      default:
        return null
    }
  }

  if (activeGame) {
    return renderGame()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              🎮
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Educational Games
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Learn through fun and interactive games, {child.name}!
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className={selectedCategory === category ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <Card 
            key={game.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:-translate-y-1 group"
          >
            {/* Game Header with Icon */}
            <div className={`h-40 bg-gradient-to-br ${game.color} flex flex-col items-center justify-center relative p-6`}>
              <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {game.icon}
              </div>
              <Badge 
                className={`${getDifficultyColor(game.difficulty)} border-0 font-semibold`}
              >
                {game.difficulty}
              </Badge>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Title and Description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {game.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Game Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium text-gray-700">{game.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-700">{game.category}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Practiced:</h4>
                  <div className="flex flex-wrap gap-1">
                    {game.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Play Button */}
                <Button
                  onClick={() => startGame(game.id)}
                  className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90 transition-all duration-300 font-semibold`}
                >
                  🎮 Play Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Game Stats */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🏆</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gaming Progress</h3>
                <p className="text-gray-600">
                  {child.name} has played {child.progress.gamesPlayed} games!
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {child.progress.gamesPlayed}
              </div>
              <div className="text-sm text-gray-500">Games Played</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}