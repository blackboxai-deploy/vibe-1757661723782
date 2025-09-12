'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import LearningSection from '@/components/sections/LearningSection'
import GamesSection from '@/components/sections/GamesSection'
import AssessmentSection from '@/components/sections/AssessmentSection'

interface Child {
  id: string
  name: string
  age: number
  avatar: string
  createdAt: string
  progress: {
    overallProgress: number
    lettersMastered: number
    numbersCompleted: number
    gamesPlayed: number
    assessmentScores: number[]
  }
}

interface Parent {
  id: string
  name: string
  email: string
  children: Child[]
}

interface DashboardProps {
  currentParent: Parent | null
  selectedChild: Child | null
  onLogout: () => void
  onAddChild: (child: any) => void
  onSelectChild: (childId: string) => void
}

export default function Dashboard({ 
  currentParent, 
  selectedChild, 
  onLogout, 
  onAddChild, 
  onSelectChild 
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false)

  if (!currentParent) return null

  const handleProgressUpdate = async (childId: string, progressUpdate: any) => {
    try {
      await fetch('/api/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId, progressUpdate }),
      })
    } catch (error) {
      console.error('Progress update error:', error)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview child={selectedChild} />
      case 'learning':
        return <LearningSection child={selectedChild} onProgressUpdate={handleProgressUpdate} />
      case 'games':
        return <GamesSection child={selectedChild} onProgressUpdate={handleProgressUpdate} />
      case 'assessment':
        return <AssessmentSection child={selectedChild} onProgressUpdate={handleProgressUpdate} />
      default:
        return <DashboardOverview child={selectedChild} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-blue-600">DE</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DyslexiaEdu Pro</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentParent.children.length > 1 && selectedChild && (
                <select
                  value={selectedChild.id}
                  onChange={(e) => onSelectChild(e.target.value)}
                  className="bg-white/20 text-white rounded-lg px-3 py-2 border border-white/30"
                >
                  {currentParent.children.map((child) => (
                    <option key={child.id} value={child.id} className="text-black">
                      {child.avatar} {child.name}
                    </option>
                  ))}
                </select>
              )}
              
              <Button
                onClick={() => setIsAddChildModalOpen(true)}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Add Child
              </Button>
              
              <Button
                onClick={onLogout}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <span>📊</span>
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center space-x-2">
                <span>📚</span>
                <span className="hidden sm:inline">Learning</span>
              </TabsTrigger>
              <TabsTrigger value="games" className="flex items-center space-x-2">
                <span>🎮</span>
                <span className="hidden sm:inline">Games</span>
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center space-x-2">
                <span>📝</span>
                <span className="hidden sm:inline">Assessment</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedChild && currentParent.children.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👶</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Add Your First Child
              </h2>
              <p className="text-gray-600 mb-8">
                Get started by adding your child's profile to begin tracking their learning progress.
              </p>
              <Button
                onClick={() => setIsAddChildModalOpen(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Add Child Profile
              </Button>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {/* Add Child Modal */}
      {isAddChildModalOpen && (
        <AddChildModal
          onClose={() => setIsAddChildModalOpen(false)}
          onAddChild={onAddChild}
        />
      )}
    </div>
  )
}

// Dashboard Overview Component
function DashboardOverview({ child }: { child: Child | null }) {
  if (!child) return <div>Select a child to view dashboard</div>

  const { progress } = child

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
              {child.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {child.name}!
              </h1>
              <p className="text-lg text-gray-600">
                Ready to continue your learning journey?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold text-blue-600">{progress.overallProgress}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <Progress value={progress.overallProgress} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Letters Mastered</p>
                <p className="text-3xl font-bold text-green-600">{progress.lettersMastered}/26</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔤</span>
              </div>
            </div>
            <Progress value={(progress.lettersMastered / 26) * 100} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Numbers Completed</p>
                <p className="text-3xl font-bold text-purple-600">{progress.numbersCompleted}/10</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔢</span>
              </div>
            </div>
            <Progress value={(progress.numbersCompleted / 10) * 100} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Games Played</p>
                <p className="text-3xl font-bold text-orange-600">{progress.gamesPlayed}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
            </div>
            <Progress value={Math.min((progress.gamesPlayed / 20) * 100, 100)} className="mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Simple Add Child Modal
function AddChildModal({ onClose, onAddChild }: { onClose: () => void; onAddChild: (child: any) => void }) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [avatar, setAvatar] = useState('👧')

  const avatars = ['👧', '👦', '🧒', '👶', '🙂', '😊', '🌟']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name && age) {
      await onAddChild({
        name,
        age: parseInt(age),
        avatar,
        progress: {
          overallProgress: 0,
          lettersMastered: 0,
          numbersCompleted: 0,
          gamesPlayed: 0,
          assessmentScores: []
        }
      })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Add Child Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Avatar</label>
            <div className="flex space-x-2">
              {avatars.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`w-10 h-10 text-xl border rounded-lg ${avatar === a ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="number"
              min="3"
              max="18"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Child
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}