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

  // Map tab keys to display labels
  const tabLabels: Record<Tab, string> = {
    posts: 'Posts',
    saved: 'Saved',
    explore: 'Activity',
  }

  return (
    <div className="flex justify-center w-full max-w-md">
      <div className="inline-flex items-center rounded-xl bg-gray-100 p-1 text-sm font-semibold text-gray-500 w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl transition-all duration-150 cursor-pointer w-full text-center ${
              activeTab === tab
                ? 'bg-white text-black shadow-sm'
                : 'hover:text-black'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>
    </div>
  )
}
