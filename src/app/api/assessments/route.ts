import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { childId, type, score, totalQuestions, correctAnswers, timeSpent, answers } = await request.json()

    if (!childId || !type || score === undefined) {
      return NextResponse.json(
        { error: 'Child ID, type, and score are required' },
        { status: 400 }
      )
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        childId,
        type,
        score,
        totalQuestions: totalQuestions || 0,
        correctAnswers: correctAnswers || 0,
        timeSpent: timeSpent || 0,
        answers: JSON.stringify(answers || [])
      }
    })

    // Update progress based on assessment type
    const currentProgress = await prisma.progress.findFirst({
      where: { childId },
      orderBy: { updatedAt: 'desc' }
    })

    if (currentProgress) {
      let updateData: any = {
        updatedAt: new Date()
      }

      // Update specific progress based on assessment type
      if (type === 'letter-recognition' || type === 'phonics') {
        updateData.lettersMastered = Math.max(
          currentProgress.lettersMastered,
          Math.floor((score / 100) * 26)
        )
      } else if (type === 'number-sequence' || type === 'numbers') {
        updateData.numbersCompleted = Math.max(
          currentProgress.numbersCompleted,
          Math.floor((score / 100) * 10)
        )
      }

      // Calculate overall progress
      const letterProgress = (updateData.lettersMastered || currentProgress.lettersMastered) / 26 * 100
      const numberProgress = (updateData.numbersCompleted || currentProgress.numbersCompleted) / 10 * 100
      const gameProgress = Math.min(currentProgress.gamesPlayed * 5, 100) // Cap at 100%
      
      updateData.overallProgress = Math.round((letterProgress + numberProgress + gameProgress) / 3)

      await prisma.progress.update({
        where: { id: currentProgress.id },
        data: updateData
      })
    }

    // Log activity
    await prisma.activity.create({
      data: {
        childId,
        type: 'ASSESSMENT',
        name: `Assessment: ${type}`,
        details: JSON.stringify({ type, score, totalQuestions, correctAnswers }),
        duration: timeSpent || 0,
        score,
        completed: true
      }
    })

    return NextResponse.json({
      success: true,
      assessment
    })

  } catch (error) {
    console.error('Create assessment error:', error)
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

    const assessments = await prisma.assessment.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      assessments
    })

  } catch (error) {
    console.error('Get assessments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}