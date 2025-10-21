export default function AdminLogin() {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="mt-1 block w-full rounded-md border-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" className="mt-1 block w-full rounded-md border-gray-300" />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</button>
      </form>
    </div>
  )
}
