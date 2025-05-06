import { Metadata } from 'next';
import Link from 'next/link';
import ApiTest from '../components/ApiTest';

export const metadata: Metadata = {
  title: 'Planiversary',
  description: 'Plan your anniversary with ease',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Welcome to Planiversary</h1>
        <nav className="mb-8 space-y-4">
          <Link href="/date-wizard" className="text-blue-600 hover:underline text-lg">
            Date Planning Wizard
          </Link>
        </nav>
        <div className="mb-8">
          <ApiTest />
        </div>
      </div>
    </main>
  );
} 