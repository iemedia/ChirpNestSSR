'use client'

type Tab = 'posts' | 'saved' | 'explore'

export default function TabSwitcher({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}) {
  const tabs: Tab[] = ['posts', 'saved', 'explore']

  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-sm font-semibold text-gray-500">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
              activeTab === tab ? 'bg-white text-black shadow-sm' : 'hover:text-black'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}
