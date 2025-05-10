'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="font-bold">Task Manager</div>
      <div className="space-x-4">
        <Link href="/tasks">Dashboard</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
    </nav>
  );
}
