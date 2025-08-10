'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { FaThumbsUp, FaThumbsDown, FaRegCommentDots, FaShare, FaAward, FaHeart } from 'react-icons/fa'
import { FiTrash2 } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { useEnsureUserProfile } from '@/hooks/useEnsureUserProfile'
import ChirpBox from '@/components/ChirpBox'
import MyPosts, { MyPostsHandle } from '@/components/MyPosts'
import GlobalTimeline, { GlobalTimelineHandle } from '@/components/GlobalTimeline'
import SavedPosts from '@/components/SavedPosts'
import Gallery from '@/components/Gallery'
import ProfileCard from '@/components/ProfileCard'
import CustomAuth from '@/components/CustomAuth'
import { PostProvider } from '@/context/PostProvider'
import MainTabSwitcher from '@/components/MainTabSwitcher'
import TabSwitcher from '@/components/TabSwitcher'

export default function Page() {
  const { user, loading } = useAuth()
  useEnsureUserProfile(user)

  const [mainActiveTab, setMainActiveTab] = useState<'myFeed' | 'explore'>('myFeed')
  const [subActiveTab, setSubActiveTab] = useState<'posts' | 'saved' | 'activity'>('posts')

  const myPostsRef = useRef<MyPostsHandle>(null)
  const globalTimelineRef = useRef<GlobalTimelineHandle>(null)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully!')
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message)
    }
  }

  const handleChirp = () => {
    myPostsRef.current?.refetch()
    globalTimelineRef.current?.refetch()
  }

  useEffect(() => {
    console.log('Page:', { loading, user })
  }, [loading, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex items-center justify-center">
        <Toaster position="top-center" />
        <CustomAuth />
      </div>
    )
  }

  return (
    <PostProvider>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-b from-purple-950 to-black bg-fixed bg-no-repeat bg-contain flex justify-center py-12 px-2 sm:px-2 md:px-2">
        <div className="max-w-6xl w-full bg-white rounded-xl shadow-lg p-4 sm:p-4 lg:p-4 flex flex-col gap-10">
          {/* Header */}
          <header className="flex justify-between items-center p-4">
            <h1 className="text-4xl font-extrabold text-gray-900 pl-2">ChirpNest 🐦</h1>
            <div className="flex items-center gap-12">
              <nav className="flex gap-8 text-gray-500 text-sm font-medium">
                <Link href="/me" className="hover:text-black transition-colors">My Page</Link>
                <Link href="/explore" className="hover:text-black transition-colors">Explore</Link>
                <Link href="/messages" className="hover:text-black transition-colors">Messages</Link>
                <Link href="/settings" className="hover:text-black transition-colors">Settings</Link>
              </nav>
              <button
                onClick={handleLogout}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-full shadow transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Top Section */}
          <section className="flex gap-6" style={{ height: '320px' }}>
            <aside className="w-[25%] min-w-0 h-full">
              <ProfileCard user={user} />
            </aside>
            <section className="w-[75%] min-w-0 h-full">
              <Gallery />
            </section>
          </section>

          {/* Bottom Section */}
          <section className="flex gap-6 items-start">
            <section className="flex-1 basis-1/4 min-w-0 flex flex-col gap-4">
              <ChirpBox user={user} onChirp={handleChirp} />

              {/* Wrap both switchers with zero gap so they look connected */}
              <div className="flex flex-col gap-0">
                <MainTabSwitcher activeTab={mainActiveTab} setActiveTab={setMainActiveTab} />
                {mainActiveTab === 'myFeed' && (
                  <TabSwitcher activeTab={subActiveTab} setActiveTab={setSubActiveTab} />
                )}
              </div>

              {mainActiveTab === 'myFeed' && subActiveTab === 'posts' && (
                <MyPosts ref={myPostsRef} user={user} />
              )}
              {mainActiveTab === 'myFeed' && subActiveTab === 'saved' && (
                <SavedPosts user={user} />
              )}
              {mainActiveTab === 'myFeed' && subActiveTab === 'activity' && (
                <p className="text-gray-500 text-sm text-center mt-4">Activity coming soon...</p>
              )}

              {mainActiveTab === 'explore' && (
                <p className="text-gray-500 text-sm text-center mt-4">Explore communities coming soon...</p>
              )}
            </section>

            <main className="flex-1 basis-3/4 min-w-0 bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-5">What’s happening?</h2>
              <GlobalTimeline ref={globalTimelineRef} user={user} />
            </main>
          </section>
        </div>
      </div>
    </PostProvider>
  )
}
