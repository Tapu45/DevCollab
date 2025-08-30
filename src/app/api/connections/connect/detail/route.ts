import { NextRequest, NextResponse } from 'next/server'
import {prisma} from '@/lib/Prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Find the first pending connection where receiverId matches userId
    const connection = await prisma.connection.findFirst({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      select: {
        id: true,
      },
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    return NextResponse.json({ connectionId: connection.id })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}