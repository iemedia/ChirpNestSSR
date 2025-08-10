'use client'

type MainTab = 'myFeed' | 'explore'

export default function MainTabSwitcher({
  activeTab,
  setActiveTab,
}: {
  activeTab: MainTab
  setActiveTab: (tab: MainTab) => void
}) {
  const tabs: MainTab[] = ['myFeed', 'explore']
  const tabLabels: Record<MainTab, string> = {
    myFeed: 'My Feed',
    explore: 'Explore',
  }

  const tabColors: Record<
    MainTab,
    { border: string; activeBg: string; hoverBg: string; text: string; hoverText: string }
  > = {
    myFeed: {
      border: 'border-green-600',
      activeBg: 'bg-green-100', // faded green background when active
      hoverBg: 'hover:bg-green-50',
      text: 'text-green-600',
      hoverText: 'hover:text-green-700',
    },
    explore: {
      border: 'border-purple-600',
      activeBg: 'bg-purple-100', // faded purple background when active
      hoverBg: 'hover:bg-purple-50',
      text: 'text-purple-600',
      hoverText: 'hover:text-purple-700',
    },
  }

  return (
    <div className="inline-flex w-full max-w-sm mx-auto mb-3 gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        const colors = tabColors[tab]

        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
            className={`flex-1 px-6 py-2.5 text-sm font-semibold cursor-pointer select-none transition-colors duration-200 rounded-xl border-2 shadow-md ${colors.border} ${
              isActive
                ? `${colors.activeBg} ${colors.text}`
                : `bg-transparent ${colors.text} ${colors.hoverBg} ${colors.hoverText}`
            } focus:outline-none`}
          >
            {tabLabels[tab]}
          </button>
        )
      })}
    </div>
  )
}
