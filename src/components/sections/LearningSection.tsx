'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

interface LearningProps {
  child: Child | null
  onProgressUpdate: (childId: string, update: any) => void
}

// Voice synthesis utility
const speakText = (text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate || 0.8
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1
    utterance.lang = 'en-US'
    
    speechSynthesis.cancel() // Cancel any ongoing speech
    speechSynthesis.speak(utterance)
  }
}

const letterData = {
  'A': { icon: '🍎', word: 'Apple', sound: 'A', phonetic: '/eɪ/' },
  'B': { icon: '📚', word: 'Book', sound: 'B', phonetic: '/biː/' },
  'C': { icon: '🐱', word: 'Cat', sound: 'C', phonetic: '/siː/' },
  'D': { icon: '🐕', word: 'Dog', sound: 'D', phonetic: '/diː/' },
  'E': { icon: '🥚', word: 'Egg', sound: 'E', phonetic: '/iː/' },
  'F': { icon: '🐟', word: 'Fish', sound: 'F', phonetic: '/ɛf/' },
  'G': { icon: '🍇', word: 'Grape', sound: 'G', phonetic: '/dʒiː/' },
  'H': { icon: '🏠', word: 'House', sound: 'H', phonetic: '/eɪtʃ/' },
  'I': { icon: '🍦', word: 'Ice cream', sound: 'I', phonetic: '/aɪ/' },
  'J': { icon: '🧃', word: 'Juice', sound: 'J', phonetic: '/dʒeɪ/' },
  'K': { icon: '🔑', word: 'Key', sound: 'K', phonetic: '/keɪ/' },
  'L': { icon: '🍋', word: 'Lemon', sound: 'L', phonetic: '/ɛl/' },
  'M': { icon: '🌙', word: 'Moon', sound: 'M', phonetic: '/ɛm/' },
  'N': { icon: '👃', word: 'Nose', sound: 'N', phonetic: '/ɛn/' },
  'O': { icon: '🍊', word: 'Orange', sound: 'O', phonetic: '/oʊ/' },
  'P': { icon: '🍕', word: 'Pizza', sound: 'P', phonetic: '/piː/' },
  'Q': { icon: '👸', word: 'Queen', sound: 'Q', phonetic: '/kjuː/' },
  'R': { icon: '🌧️', word: 'Rain', sound: 'R', phonetic: '/ɑː/' },
  'S': { icon: '☀️', word: 'Sun', sound: 'S', phonetic: '/ɛs/' },
  'T': { icon: '🌳', word: 'Tree', sound: 'T', phonetic: '/tiː/' },
  'U': { icon: '☂️', word: 'Umbrella', sound: 'U', phonetic: '/juː/' },
  'V': { icon: '🎻', word: 'Violin', sound: 'V', phonetic: '/viː/' },
  'W': { icon: '💧', word: 'Water', sound: 'W', phonetic: '/ˈdʌbəl.juː/' },
  'X': { icon: '❌', word: 'X-ray', sound: 'X', phonetic: '/ɛks/' },
  'Y': { icon: '🟡', word: 'Yellow', sound: 'Y', phonetic: '/waɪ/' },
  'Z': { icon: '🦓', word: 'Zebra', sound: 'Z', phonetic: '/ziː/' }
}

const numberData = {
  '1': { icon: '1️⃣', word: 'One', sound: '1' },
  '2': { icon: '2️⃣', word: 'Two', sound: '2' },
  '3': { icon: '3️⃣', word: 'Three', sound: '3' },
  '4': { icon: '4️⃣', word: 'Four', sound: '4' },
  '5': { icon: '5️⃣', word: 'Five', sound: '5' },
  '6': { icon: '6️⃣', word: 'Six', sound: '6' },
  '7': { icon: '7️⃣', word: 'Seven', sound: '7' },
  '8': { icon: '8️⃣', word: 'Eight', sound: '8' },
  '9': { icon: '9️⃣', word: 'Nine', sound: '9' },
  '10': { icon: '🔟', word: 'Ten', sound: '10' }
}

export default function LearningSection({ child, onProgressUpdate }: LearningProps) {
  const [activeTab, setActiveTab] = useState('alphabet')
  const [isPlaying, setIsPlaying] = useState(false)

  if (!child) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a child to start learning
        </h2>
      </div>
    )
  }

  const playLetter = async (letter: string) => {
    const data = letterData[letter as keyof typeof letterData]
    if (data) {
      setIsPlaying(true)
      
      // Speak the letter name, then the word
      speakText(`${letter}`)
      
      setTimeout(() => {
        speakText(`${letter} for ${data.word}`)
      }, 800)

      // Log the activity
      await onProgressUpdate(child.id, {
        activityType: 'LEARNING',
        activityName: `Letter ${letter} Practice`,
        activityDetails: { letter, word: data.word },
        duration: 3
      })

      setTimeout(() => setIsPlaying(false), 2000)
    }
  }

  const playNumber = async (number: string) => {
    const data = numberData[number as keyof typeof numberData]
    if (data) {
      setIsPlaying(true)
      
      // Speak the number
      speakText(`${data.word}`)

      // Log the activity
      await onProgressUpdate(child.id, {
        activityType: 'LEARNING',
        activityName: `Number ${number} Practice`,
        activityDetails: { number, word: data.word },
        duration: 2
      })

      setTimeout(() => setIsPlaying(false), 1500)
    }
  }

  const playAllLetters = async () => {
    setIsPlaying(true)
    const letters = Object.keys(letterData)
    
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i]
      const data = letterData[letter as keyof typeof letterData]
      
      setTimeout(() => {
        speakText(`${letter} for ${data.word}`)
      }, i * 1500)
    }

    // Log the activity
    await onProgressUpdate(child.id, {
      activityType: 'LEARNING',
      activityName: 'Complete Alphabet Review',
      activityDetails: { type: 'full-alphabet' },
      duration: letters.length * 1.5
    })

    setTimeout(() => setIsPlaying(false), letters.length * 1500)
  }

  const playAllNumbers = async () => {
    setIsPlaying(true)
    const numbers = Object.keys(numberData)
    
    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i]
      const data = numberData[number as keyof typeof numberData]
      
      setTimeout(() => {
        speakText(data.word)
      }, i * 1200)
    }

    // Log the activity
    await onProgressUpdate(child.id, {
      activityType: 'LEARNING',
      activityName: 'Complete Numbers Review',
      activityDetails: { type: 'full-numbers' },
      duration: numbers.length * 1.2
    })

    setTimeout(() => setIsPlaying(false), numbers.length * 1200)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              📚
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Learning Center
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Interactive alphabet and number learning for {child.name}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
          <TabsTrigger value="alphabet" className="text-base font-semibold">
            🔤 Alphabet
          </TabsTrigger>
          <TabsTrigger value="numbers" className="text-base font-semibold">
            🔢 Numbers
          </TabsTrigger>
        </TabsList>

        {/* Alphabet Tab */}
        <TabsContent value="alphabet" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-semibold">Alphabet Learning</CardTitle>
                <p className="text-gray-600">Click any letter to hear its sound and see examples</p>
              </div>
              <Button
                onClick={playAllLetters}
                disabled={isPlaying}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isPlaying ? '🔊 Playing...' : '🔊 Play All'}
              </Button>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {Object.entries(letterData).map(([letter, data]) => (
                  <div
                    key={letter}
                    onClick={() => playLetter(letter)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 group active:scale-95"
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {data.icon}
                    </div>
                    <div className="text-xl font-bold text-blue-600 mb-1">
                      {letter}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {data.word}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {data.phonetic}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Numbers Tab */}
        <TabsContent value="numbers" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-semibold">Number Learning</CardTitle>
                <p className="text-gray-600">Click any number to hear its pronunciation</p>
              </div>
              <Button
                onClick={playAllNumbers}
                disabled={isPlaying}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isPlaying ? '🔊 Playing...' : '🔊 Play All'}
              </Button>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-6">
                {Object.entries(numberData).map(([number, data]) => (
                  <div
                    key={number}
                    onClick={() => playNumber(number)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:-translate-y-1 group active:scale-95"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {data.icon}
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {number}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {data.word}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🏆</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Learning Progress</h3>
                <p className="text-gray-600">
                  {child.name} has mastered {child.progress.lettersMastered} letters 
                  and {child.progress.numbersCompleted} numbers!
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}