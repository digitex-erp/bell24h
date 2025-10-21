export default function DashboardPage() {
  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Dashboard content will go here */}
          <div className="px-4 py-8 sm:px-0">
            <div className="rounded-lg border-4 border-dashed border-gray-200 p-4 text-center">
              <p className="text-gray-500">Welcome to your dashboard!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
