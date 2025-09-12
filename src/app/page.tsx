'use client'

import { useState } from 'react'

// Voice synthesis utility
const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 1
    utterance.lang = 'en-US'
    
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }
}

const letterData = {
  'A': { icon: '🍎', word: 'Apple' },
  'B': { icon: '📚', word: 'Book' },
  'C': { icon: '🐱', word: 'Cat' },
  'D': { icon: '🐕', word: 'Dog' },
  'E': { icon: '🥚', word: 'Egg' },
  'F': { icon: '🐟', word: 'Fish' },
  'G': { icon: '🍇', word: 'Grape' },
  'H': { icon: '🏠', word: 'House' },
  'I': { icon: '🍦', word: 'Ice' },
  'J': { icon: '🧃', word: 'Juice' },
  'K': { icon: '🔑', word: 'Key' },
  'L': { icon: '🍋', word: 'Lemon' },
  'M': { icon: '🌙', word: 'Moon' },
  'N': { icon: '👃', word: 'Nose' },
  'O': { icon: '🍊', word: 'Orange' },
  'P': { icon: '🍕', word: 'Pizza' },
  'Q': { icon: '👸', word: 'Queen' },
  'R': { icon: '🌧️', word: 'Rain' },
  'S': { icon: '☀️', word: 'Sun' },
  'T': { icon: '🌳', word: 'Tree' },
  'U': { icon: '☂️', word: 'Umbrella' },
  'V': { icon: '🎻', word: 'Violin' },
  'W': { icon: '💧', word: 'Water' },
  'X': { icon: '❌', word: 'X-ray' },
  'Y': { icon: '🟡', word: 'Yellow' },
  'Z': { icon: '🦓', word: 'Zebra' }
}

const numberData = {
  '1': { icon: '1️⃣', word: 'One' },
  '2': { icon: '2️⃣', word: 'Two' },
  '3': { icon: '3️⃣', word: 'Three' },
  '4': { icon: '4️⃣', word: 'Four' },
  '5': { icon: '5️⃣', word: 'Five' },
  '6': { icon: '6️⃣', word: 'Six' },
  '7': { icon: '7️⃣', word: 'Seven' },
  '8': { icon: '8️⃣', word: 'Eight' },
  '9': { icon: '9️⃣', word: 'Nine' },
  '10': { icon: '🔟', word: 'Ten' }
}

// Letter Matching Game
function LetterMatchingGame({ onExit, onComplete }: { onExit: () => void; onComplete: (score: number) => void }) {
  const [pairs] = useState([
    { letter: 'A', icon: '🍎', word: 'Apple' },
    { letter: 'B', icon: '📚', word: 'Book' },
    { letter: 'C', icon: '🐱', word: 'Cat' }
  ])
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')

  const checkMatch = (letter: string, word: string) => {
    const pair = pairs.find(p => p.letter === letter)
    if (pair && pair.word === word) {
      setMatched(prev => [...prev, letter])
      setScore(prev => prev + 10)
      setFeedback('🎉 Great match!')
      speakText(`Great! ${letter} for ${word}`)
      
      if (matched.length + 1 >= pairs.length) {
        setTimeout(() => onComplete(score + 10), 1500)
      }
    } else {
      setFeedback('❌ Try again!')
    }
    
    setTimeout(() => setFeedback(''), 1500)
    setSelectedLetter(null)
    setSelectedWord(null)
  }

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-800">🔤 Letter Matching Game</h1>
            <button onClick={onExit} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Exit</button>
          </div>
          <p className="text-gray-600 mt-2">Score: {score} | Matched: {matched.length}/{pairs.length}</p>
        </div>

        {feedback && (
          <div className="text-center mb-4">
            <div className="inline-block px-6 py-3 bg-white rounded-full shadow-lg text-lg font-semibold">
              {feedback}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">Letters</h2>
            <div className="grid grid-cols-2 gap-4">
              {pairs.map((pair) => (
                <button
                  key={pair.letter}
                  onClick={() => {
                    if (matched.includes(pair.letter)) return
                    setSelectedLetter(pair.letter)
                    if (selectedWord) checkMatch(pair.letter, selectedWord)
                  }}
                  disabled={matched.includes(pair.letter)}
                  className={`p-6 rounded-xl border-2 font-bold text-2xl transition-all ${
                    matched.includes(pair.letter)
                      ? 'bg-green-100 border-green-300 cursor-not-allowed'
                      : selectedLetter === pair.letter
                      ? 'bg-blue-100 border-blue-400 scale-105'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {matched.includes(pair.letter) ? '✅' : pair.letter}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">Words</h2>
            <div className="space-y-4">
              {pairs.map((pair) => (
                <button
                  key={pair.word}
                  onClick={() => {
                    if (matched.includes(pair.letter)) return
                    setSelectedWord(pair.word)
                    if (selectedLetter) checkMatch(selectedLetter, pair.word)
                  }}
                  disabled={matched.includes(pair.letter)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center space-x-3 transition-all ${
                    matched.includes(pair.letter)
                      ? 'bg-green-100 border-green-300 cursor-not-allowed'
                      : selectedWord === pair.word
                      ? 'bg-blue-100 border-blue-400 scale-105'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="text-2xl">{pair.icon}</span>
                  <span className="font-semibold text-lg">{pair.word}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [currentGame, setCurrentGame] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [child] = useState({ name: 'Emma', avatar: '👧' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: userPassword }),
      })

      const data = await response.json()
      if (data.success) {
        setIsLoggedIn(true)
        localStorage.setItem('dyslexia-auth', JSON.stringify({ parentId: data.parent.id }))
      } else {
        alert('Login failed. Try: parent@demo.com / demo123')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Error connecting to server. Try: parent@demo.com / demo123')
      if (userEmail === 'parent@demo.com' && userPassword === 'demo123') {
        setIsLoggedIn(true)
      }
    }
  }

  const playLetter = (letter: string) => {
    const data = letterData[letter as keyof typeof letterData]
    if (data) {
      speakText(`${letter} for ${data.word}`)
    }
  }

  const playNumber = (number: string) => {
    const data = numberData[number as keyof typeof numberData]
    if (data) {
      speakText(data.word)
    }
  }

  const playAllLetters = () => {
    const letters = Object.keys(letterData)
    letters.forEach((letter, index) => {
      setTimeout(() => {
        const data = letterData[letter as keyof typeof letterData]
        speakText(`${letter} for ${data.word}`)
      }, index * 1500)
    })
  }

  const playAllNumbers = () => {
    const numbers = Object.keys(numberData)
    numbers.forEach((number, index) => {
      setTimeout(() => {
        const data = numberData[number as keyof typeof numberData]
        speakText(data.word)
      }, index * 1200)
    })
  }

  if (currentGame === 'letter-matching') {
    return (
      <LetterMatchingGame
        onExit={() => setCurrentGame(null)}
        onComplete={(score) => {
          alert(`Game completed! Score: ${score}`)
          setCurrentGame(null)
        }}
      />
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/imagine-v1/o/generated_images%2F1ded0e31-9a27-4b2c-b26a-ac4da1f50a8d?alt=media&token=04c8088b-e652-42d6-b6d1-e3b5709c2b3b')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="bg-black/60 absolute inset-0"></div>
        <div className="relative z-10 bg-white/95 p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">DE</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">DyslexiaEdu Pro</h1>
            <p className="text-gray-600">Parent Login</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="parent@demo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="demo123"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800"><strong>Demo:</strong> parent@demo.com / demo123</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">DE</span>
            </div>
            <h1 className="text-xl font-bold">DyslexiaEdu Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>Welcome, Parent | Learning with: {child.avatar} {child.name}</span>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-0">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'learning', label: 'Learning', icon: '📚' },
              { id: 'games', label: 'Games', icon: '🎮' },
              { id: 'assessment', label: 'Assessment', icon: '📝' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`flex items-center space-x-2 px-6 py-4 transition-all border-b-3 ${
                  currentSection === item.id
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentSection === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome back, {child.name}!</h1>
              <p className="text-lg text-gray-600 mb-6">Ready to continue your learning journey?</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentSection('learning')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Continue Learning →
                </button>
                <button
                  onClick={() => setCurrentSection('games')}
                  className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Play Games
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Overall Progress', value: '85%', color: 'blue' },
                { title: 'Letters Mastered', value: '26/26', color: 'green' },
                { title: 'Numbers Completed', value: '10/10', color: 'purple' },
                { title: 'Games Played', value: '12', color: 'orange' }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentSection === 'learning' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">📚 Learning Center</h1>
              <p className="text-gray-600 mb-6">Click on letters and numbers to hear their sounds!</p>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">🔤 Alphabet</h2>
                  <button
                    onClick={playAllLetters}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    🔊 Play All
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                  {Object.entries(letterData).map(([letter, data]) => (
                    <button
                      key={letter}
                      onClick={() => playLetter(letter)}
                      className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all group"
                    >
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{data.icon}</div>
                      <div className="text-lg font-bold text-blue-600 mb-1">{letter}</div>
                      <div className="text-xs text-gray-600">{data.word}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">🔢 Numbers</h2>
                  <button
                    onClick={playAllNumbers}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    🔊 Play All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                  {Object.entries(numberData).map(([number, data]) => (
                    <button
                      key={number}
                      onClick={() => playNumber(number)}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-purple-400 hover:shadow-lg hover:-translate-y-1 transition-all group"
                    >
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{data.icon}</div>
                      <div className="text-xl font-bold text-purple-600 mb-2">{number}</div>
                      <div className="text-sm text-gray-600">{data.word}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSection === 'games' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">🎮 Educational Games</h1>
              <p className="text-gray-600 mb-6">Learn through fun and interactive games!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'letter-matching', title: 'Letter Matching', icon: '🔤', description: 'Match letters with words' },
                  { id: 'word-builder', title: 'Word Builder', icon: '🏗️', description: 'Build words from letters' },
                  { id: 'sound-safari', title: 'Sound Safari', icon: '🦁', description: 'Find animals by sounds' },
                  { id: 'number-adventure', title: 'Number Adventure', icon: '🔢', description: 'Adventure with numbers' },
                  { id: 'pattern-puzzle', title: 'Pattern Puzzle', icon: '🧩', description: 'Complete patterns' },
                  { id: 'reading-race', title: 'Reading Race', icon: '🏁', description: 'Read against time' }
                ].map((game) => (
                  <div key={game.id} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="text-4xl mb-4">{game.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{game.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                    <button
                      onClick={() => {
                        if (game.id === 'letter-matching') {
                          setCurrentGame(game.id)
                        } else {
                          alert(`Starting ${game.title}...`)
                        }
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
                    >
                      🎮 Play Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentSection === 'assessment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">📝 Assessment</h1>
              <p className="text-gray-600 mb-6">Quick evaluation of learning progress</p>
              
              <div className="max-w-2xl mx-auto">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Ready</h2>
                  <p className="text-gray-600 mb-6">Test your knowledge with our comprehensive assessment</p>
                  <button 
                    onClick={() => alert('Starting assessment...')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 DyslexiaEdu Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}