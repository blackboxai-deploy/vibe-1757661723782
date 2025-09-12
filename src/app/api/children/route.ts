import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { parentId, name, age, avatar } = await request.json()

    if (!parentId || !name || !age || !avatar) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create child
    const child = await prisma.child.create({
      data: {
        name,
        age: parseInt(age),
        avatar,
        parentId
      }
    })

    // Create initial progress record
    await prisma.progress.create({
      data: {
        childId: child.id,
        overallProgress: 0,
        lettersMastered: 0,
        numbersCompleted: 0,
        gamesPlayed: 0,
        totalPlayTime: 0
      }
    })

    return NextResponse.json({
      success: true,
      child: {
        id: child.id,
        name: child.name,
        age: child.age,
        avatar: child.avatar,
        createdAt: child.createdAt.toISOString().split('T')[0],
        progress: {
          overallProgress: 0,
          lettersMastered: 0,
          numbersCompleted: 0,
          gamesPlayed: 0,
          assessmentScores: []
        }
      }
    })

  } catch (error) {
    console.error('Create child error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json(
        { error: 'Parent ID is required' },
        { status: 400 }
      )
    }

    const children = await prisma.child.findMany({
      where: { parentId },
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
    })

    const transformedChildren = children.map(child => ({
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
        assessmentScores: child.assessments.map(a => a.score)
      }
    }))

    return NextResponse.json({
      success: true,
      children: transformedChildren
    })

  } catch (error) {
    console.error('Get children error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}