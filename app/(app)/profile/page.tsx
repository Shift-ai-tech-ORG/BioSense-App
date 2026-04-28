import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      goalType: true,
      goalText: true,
      goalDeadline: true,
      allergies: true,
      conditions: true,
      lifestyle: true,
      subscriptionStatus: true,
      createdAt: true,
    },
  })

  if (!user) redirect('/login')

  return (
    <ProfileClient
      user={{
        ...user,
        goalDeadline: user.goalDeadline?.toISOString().split('T')[0] ?? null,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  )
}
