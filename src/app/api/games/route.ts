import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { childId, gameId, gameName, score, level, duration, completed, data } = await request.json()

    if (!childId || !gameId || !gameName) {
      return NextResponse.json(
        { error: 'Child ID, game ID, and game name are required' },
        { status: 400 }
      )
    }

    // Create game session
    const gameSession = await prisma.gameSession.create({
      data: {
        childId,
        gameId,
        gameName,
        score: score || null,
        level: level || 1,
        duration: duration || 0,
        completed: completed || false,
        data: data ? JSON.stringify(data) : null
      }
    })

    // Update progress - increment games played
    const currentProgress = await prisma.progress.findFirst({
      where: { childId },
      orderBy: { updatedAt: 'desc' }
    })

    if (currentProgress) {
      await prisma.progress.update({
        where: { id: currentProgress.id },
        data: {
          gamesPlayed: currentProgress.gamesPlayed + 1,
          totalPlayTime: currentProgress.totalPlayTime + Math.floor((duration || 0) / 60),
          updatedAt: new Date()
        }
      })
    }

    // Log activity
    await prisma.activity.create({
      data: {
        childId,
        type: 'GAME',
        name: gameName,
        details: JSON.stringify({ gameId, level, score }),
        duration: duration || 0,
        score,
        completed: completed || false
      }
    })

    return NextResponse.json({
      success: true,
      gameSession
    })

  } catch (error) {
    console.error('Create game session error:', error)
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
    const gameId = searchParams.get('gameId')

    if (!childId) {
      return NextResponse.json(
        { error: 'Child ID is required' },
        { status: 400 }
      )
    }

    let whereClause: any = { childId }
    if (gameId) {
      whereClause.gameId = gameId
    }

    const gameSessions = await prisma.gameSession.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      success: true,
      gameSessions
    })

  } catch (error) {
    console.error('Get game sessions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}