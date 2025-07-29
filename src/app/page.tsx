'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useEnsureUserProfile } from '@/hooks/useEnsureUserProfile'
import ChirpBox from '@/components/ChirpBox'
import MyPosts, { MyPostsHandle } from '@/components/MyPosts'
import GlobalTimeline, { GlobalTimelineHandle } from '@/components/GlobalTimeline'
import Gallery from '@/components/Gallery'
import ProfileCard from '@/components/ProfileCard'
import { supabase } from '@/lib/supabaseClient'
import { Toaster, toast } from 'react-hot-toast'
import CustomAuth from '@/components/CustomAuth'

export default function Page() {
  const { user, loading } = useAuth()
  useEnsureUserProfile(user)

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
    <>
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
          <section className="flex gap-8" style={{ height: '320px' }}>
            <div className="w-[25%] min-w-0 h-full">
              <ProfileCard user={user} />
            </div>
            <div className="w-[75%] min-w-0 h-full">
              <Gallery />
            </div>
          </section>

          {/* Bottom Section */}
          <section className="flex gap-8">
            <main className="w-[25%] flex flex-col gap-6">
              <ChirpBox user={user} onChirp={handleChirp} />
              <MyPosts ref={myPostsRef} user={user} />
            </main>

            <aside className="w-[75%] bg-white rounded-lg p-6 shadow-md">
              <GlobalTimeline ref={globalTimelineRef} user={user} />
            </aside>
          </section>
        </div>
      </div>
    </>
  )
}
