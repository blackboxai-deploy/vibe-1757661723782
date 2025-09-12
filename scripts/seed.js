const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if demo parent already exists
    const existingParent = await prisma.parent.findUnique({
      where: { email: 'parent@demo.com' }
    })

    if (existingParent) {
      console.log('Demo data already exists')
      return
    }

    console.log('Seeding database...')

    // Create demo parent
    const hashedPassword = await bcrypt.hash('demo123', 12)
    
    const demoParent = await prisma.parent.create({
      data: {
        email: 'parent@demo.com',
        password: hashedPassword,
        name: 'Sarah Johnson'
      }
    })

    // Create demo children
    const child1 = await prisma.child.create({
      data: {
        name: 'Emma',
        age: 8,
        avatar: '👧',
        parentId: demoParent.id
      }
    })

    const child2 = await prisma.child.create({
      data: {
        name: 'Alex',
        age: 6,
        avatar: '👦',
        parentId: demoParent.id
      }
    })

    // Create progress for Emma
    await prisma.progress.create({
      data: {
        childId: child1.id,
        overallProgress: 85,
        lettersMastered: 26,
        numbersCompleted: 10,
        gamesPlayed: 12,
        totalPlayTime: 240
      }
    })

    // Create progress for Alex
    await prisma.progress.create({
      data: {
        childId: child2.id,
        overallProgress: 65,
        lettersMastered: 18,
        numbersCompleted: 8,
        gamesPlayed: 8,
        totalPlayTime: 180
      }
    })

    // Create some assessments for Emma
    await prisma.assessment.createMany({
      data: [
        {
          childId: child1.id,
          type: 'letter-recognition',
          score: 75,
          totalQuestions: 20,
          correctAnswers: 15,
          timeSpent: 300,
          answers: JSON.stringify(['A', 'B', 'C', 'D', 'E'])
        },
        {
          childId: child1.id,
          type: 'phonics',
          score: 80,
          totalQuestions: 15,
          correctAnswers: 12,
          timeSpent: 420,
          answers: JSON.stringify(['sound1', 'sound2', 'sound3'])
        },
        {
          childId: child1.id,
          type: 'number-sequence',
          score: 85,
          totalQuestions: 10,
          correctAnswers: 8,
          timeSpent: 240,
          answers: JSON.stringify([1, 2, 3, 4, 5])
        },
        {
          childId: child1.id,
          type: 'spelling',
          score: 90,
          totalQuestions: 12,
          correctAnswers: 11,
          timeSpent: 360,
          answers: JSON.stringify(['apple', 'ball', 'cat'])
        }
      ]
    })

    // Create some assessments for Alex
    await prisma.assessment.createMany({
      data: [
        {
          childId: child2.id,
          type: 'letter-recognition',
          score: 60,
          totalQuestions: 20,
          correctAnswers: 12,
          timeSpent: 420,
          answers: JSON.stringify(['A', 'B', 'C'])
        },
        {
          childId: child2.id,
          type: 'phonics',
          score: 65,
          totalQuestions: 15,
          correctAnswers: 10,
          timeSpent: 480,
          answers: JSON.stringify(['sound1', 'sound2'])
        },
        {
          childId: child2.id,
          type: 'number-sequence',
          score: 70,
          totalQuestions: 10,
          correctAnswers: 7,
          timeSpent: 300,
          answers: JSON.stringify([1, 2, 3, 4])
        }
      ]
    })

    console.log('Database seeded successfully!')
    console.log('Demo login: parent@demo.com / demo123')

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()