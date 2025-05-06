import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planiversary - Event Planning Made Easy',
  description: 'Plan your special dates and parties with ease using Planiversary.',
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Welcome to Planiversary</h1>
      <p className="text-xl text-gray-600">Your event planning journey begins here.</p>
    </main>
  )
} 