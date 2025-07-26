'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatDistanceToNow } from 'date-fns'

type TweetUser = {
  email: string | null
  username: string | null
}

type Tweet = {
  id: string
  content: string
  created_at: string
  user_id: string
  users?: TweetUser
}

export default function GlobalTimeline() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTweets = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from<Tweet>('tweets')
        .select(`
          id,
          content,
          created_at,
          user_id,
          users!tweets_user_id_fkey (
            email,
            username
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTweets(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()

    const subscription = supabase
      .channel('public:tweets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tweets' }, () => {
        fetchTweets()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  if (loading) return <p className="text-center p-4 text-black">Loading tweets...</p>
  if (error) return <p className="text-center p-4 text-red-600">Error: {error}</p>

  return (
    <div className="space-y-4">
      {tweets.length === 0 && <p className="text-center text-black">No tweets yet.</p>}

      {tweets.map(tweet => {
        const username = tweet.users?.username || tweet.users?.email || 'Unknown user'
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`

        return (
          <div
            key={tweet.id}
            className="p-4 rounded-xl bg-white text-black shadow-md shadow-black/10 border-t-2 border-solid border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={avatarUrl}
                alt={`${username} avatar`}
                className="w-10 h-10 rounded-full"
              />
              <span className="font-semibold">{username}</span>
            </div>
            <p className="whitespace-pre-wrap">{tweet.content}</p>
            <div className="text-xs text-gray-500 mt-2">
              {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

