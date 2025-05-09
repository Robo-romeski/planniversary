import { Metadata } from 'next';
import Link from 'next/link';
// import ApiTest from '../components/ApiTest';

export const metadata: Metadata = {
  title: 'Planiversary',
  description: 'Plan your anniversary with ease',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <nav className="fixed top-0 left-0 w-full bg-gray-100 shadow-sm flex justify-center items-center space-x-8 z-50">
        <Link href="/date-wizard" className="text-blue-600 hover:underline text-lg py-4">
          Date Planning Wizard
        </Link>
        <Link href="/profile" className="text-blue-600 hover:underline text-lg py-4">
          Profile
        </Link>
        <Link href="/party-wizard" className="text-blue-600 hover:underline text-lg py-4">
          Party Planning Wizard
        </Link>
      </nav>
      <div className="flex flex-col items-center justify-center w-full min-h-screen pt-16">
        <h1 className="text-4xl font-bold mb-8 text-center text-orange-500">Welcome to Planiversary</h1>
        {/* <div className="mb-8">
          <ApiTest />
        </div> */}
      </div>
    </main>
  );
} 