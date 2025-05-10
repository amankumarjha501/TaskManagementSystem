export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <h1 className="text-4xl font-bold">Welcome to Task Manager</h1>
      <p className="text-lg">Manage your tasks efficiently and collaborate with your team.</p>
      <div className="flex gap-4 mt-6">
        <a
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </a>
        <a
          href="/register"
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Register
        </a>
      </div>
    </main>
  )
}
