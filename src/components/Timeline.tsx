'use client'

import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
} from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatDistanceToNow } from 'date-fns'

type Tweet = {
  id: string
  content: string
  created_at: string
  user_id: string
  users?: {
    email?: string
    username?: string
  }
}

export type TimelineHandle = {
  refetch: () => void
}

const Timeline = forwardRef((props, ref: Ref<TimelineHandle>) => {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTweets = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('tweets')
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

  useImperativeHandle(ref, () => ({
    refetch: fetchTweets,
  }))

  useEffect(() => {
    fetchTweets()

    const subscription = supabase
      .channel('public:tweets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tweets' },
        () => {
          fetchTweets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  if (loading)
    return <p className="text-center p-4 text-white">Loading tweets...</p>
  if (error)
    return <p className="text-center p-4 text-red-300">Error: {error}</p>

  return (
    <div className="space-y-4">
      {tweets.length === 0 && (
        <p className="text-center text-white">No tweets yet.</p>
      )}

      {tweets.map((tweet) => {
        const username = tweet.users?.username || tweet.users?.email || 'Unknown user'
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`

        return (
          <div
            key={tweet.id}
            className="p-4 rounded-xl bg-gray-900 text-gray-100 shadow-md shadow-black/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <img
                src={avatarUrl}
                alt={`${username} avatar`}
                className="w-6 h-6 rounded-full"
                loading="lazy"
              />
              <span className="text-white font-semibold">{username}</span>
            </div>
            <p className="whitespace-pre-wrap">{tweet.content}</p>
            <div className="text-xs text-gray-400 mt-2">
              {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
            </div>
          </div>
        )
      })}
    </div>
  )
})

export default Timeline






