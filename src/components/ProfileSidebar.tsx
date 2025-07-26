export default function ProfileSidebar() {
  return (
    <div className="flex flex-col items-center bg-gray-900 text-white rounded-xl shadow-md h-full p-6">
      <img
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chirpy&backgroundColor=transparent"
        alt="User Avatar"
        className="w-24 h-24 rounded-full border-2 border-purple-500 shadow mb-4"
        loading="lazy"
      />

      <h2 className="text-xl font-bold mb-1">Chirpy User</h2>
      <p className="text-sm text-gray-400 mb-4 text-center px-2">
        Sharing vibes, tweets, and sometimes memes 🐥
      </p>

      <div className="text-xs text-gray-500 space-y-1 text-center">
        <p>📍 Somewhere on the Web</p>
        <p>✨ Joined July 2025</p>
      </div>
    </div>
  )
}
