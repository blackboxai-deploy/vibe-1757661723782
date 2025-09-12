import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find parent by email
    const parent = await prisma.parent.findUnique({
      where: { email },
      include: {
        children: {
          include: {
            progress: {
              orderBy: { updatedAt: 'desc' },
              take: 1
            },
            assessments: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        }
      }
    })

    if (!parent) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, parent.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Transform data to match frontend interface
    const transformedParent = {
      id: parent.id,
      name: parent.name,
      email: parent.email,
      children: parent.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        age: child.age,
        avatar: child.avatar,
        createdAt: child.createdAt.toISOString().split('T')[0],
        progress: {
          overallProgress: child.progress[0]?.overallProgress || 0,
          lettersMastered: child.progress[0]?.lettersMastered || 0,
          numbersCompleted: child.progress[0]?.numbersCompleted || 0,
          gamesPlayed: child.progress[0]?.gamesPlayed || 0,
          assessmentScores: child.assessments.map((a: any) => a.score)
        }
      }))
    }

    return NextResponse.json({
      success: true,
      parent: transformedParent
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}