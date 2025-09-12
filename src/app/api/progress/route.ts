import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { childId, progressUpdate } = await request.json()

    if (!childId || !progressUpdate) {
      return NextResponse.json(
        { error: 'Child ID and progress data are required' },
        { status: 400 }
      )
    }

    // Get current progress
    let currentProgress = await prisma.progress.findFirst({
      where: { childId },
      orderBy: { updatedAt: 'desc' }
    })

    if (!currentProgress) {
      // Create initial progress if doesn't exist
      currentProgress = await prisma.progress.create({
        data: {
          childId,
          overallProgress: 0,
          lettersMastered: 0,
          numbersCompleted: 0,
          gamesPlayed: 0,
          totalPlayTime: 0
        }
      })
    }

    // Update progress
    const updatedProgress = await prisma.progress.update({
      where: { id: currentProgress.id },
      data: {
        ...progressUpdate,
        updatedAt: new Date()
      }
    })

    // Log activity
    if (progressUpdate.activityType) {
      await prisma.activity.create({
        data: {
          childId,
          type: progressUpdate.activityType,
          name: progressUpdate.activityName || 'Learning Activity',
          details: JSON.stringify(progressUpdate.activityDetails || {}),
          duration: progressUpdate.duration || 0,
          score: progressUpdate.score,
          completed: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      progress: updatedProgress
    })

  } catch (error) {
    console.error('Update progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json(
        { error: 'Child ID is required' },
        { status: 400 }
      )
    }

    const progress = await prisma.progress.findFirst({
      where: { childId },
      orderBy: { updatedAt: 'desc' }
    })

    const activities = await prisma.activity.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      progress,
      activities
    })

  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}