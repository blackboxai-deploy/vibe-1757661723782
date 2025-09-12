import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if parent already exists
    const existingParent = await prisma.parent.findUnique({
      where: { email }
    })

    if (existingParent) {
      return NextResponse.json(
        { error: 'Parent with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create parent
    const parent = await prisma.parent.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    return NextResponse.json({
      success: true,
      parent: {
        id: parent.id,
        name: parent.name,
        email: parent.email,
        children: []
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}