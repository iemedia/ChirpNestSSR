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

type PostUser = {
  email: string | null
  username: string | null
}

type Post = {
  id: string
  content: string
  created_at: string
  user_id: string
  users?: PostUser
}

export type GlobalTimelineHandle = {
  refetch: () => void
}

const PAGE_SIZE = 5

const GlobalTimeline = forwardRef(
  ({ user }: { user: any }, ref: Ref<GlobalTimelineHandle>) => {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'everyone' | 'following'>('everyone')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchPosts = async (pageToFetch = 1) => {
      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from('posts')
          .select(
            `
          id,
          content,
          created_at,
          user_id,
          users!posts_user_id_fkey (
            email,
            username
          )
        `
          )
          .order('created_at', { ascending: false })

        if (filter === 'following') {
          const { data: following, error: followingError } = await supabase
            .from('follows')
            .select('followed_id')
            .eq('follower_id', user.id)

          if (followingError) throw followingError

          const ids = following.map((f) => f.followed_id)
          query = query.in('user_id', ids)
        }

        const from = (pageToFetch - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        const { data, error } = await query.range(from, to)

        if (error) throw error

        if (pageToFetch === 1) {
          setPosts(data || [])
        } else {
          setPosts((prev) => [...prev, ...(data || [])])
        }

        setHasMore((data?.length || 0) === PAGE_SIZE)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    useImperativeHandle(ref, () => ({
      refetch: () => {
        setPage(1)
        fetchPosts(1)
      },
    }))

    useEffect(() => {
      setPage(1)
      fetchPosts(1)

      const channel = supabase
        .channel('public:posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          () => fetchPosts(1)
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }, [filter])

    const loadMore = () => {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage)
    }

    if (loading && posts.length === 0)
      return <p className="text-center p-4 text-black">Loading posts...</p>
    if (error)
      return <p className="text-center p-4 text-red-600">Error: {error}</p>

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-black">What's Happening</h2>
          <div className="flex gap-6">
            <button
              className={`text-sm font-semibold hover:text-gray-900 transition cursor-pointer ${
                filter === 'everyone' ? 'text-gray-900' : 'text-gray-500'
              }`}
              onClick={() => {
                setPage(1)
                setFilter('everyone')
              }}
            >
              Everyone
            </button>
            <button
              className={`text-sm font-semibold hover:text-gray-900 transition cursor-pointer ${
                filter === 'following' ? 'text-gray-900' : 'text-gray-500'
              }`}
              onClick={() => {
                setPage(1)
                setFilter('following')
              }}
            >
              Following
            </button>
          </div>
        </div>

        {posts.length === 0 && (
          <p className="text-center text-black">No posts yet.</p>
        )}

        {posts.map((post) => {
          const username =
            post.users?.username || post.users?.email || 'Unknown user'
          const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            username
          )}`

          return (
            <div
              key={post.id}
              className="p-6 rounded-xl bg-white text-black shadow-md shadow-black/10 border-t-2 border-solid border-gray-200 animate-fade-in"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={avatarUrl}
                  alt={`${username} avatar`}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-semibold">{username}</span>
              </div>
              <p className="whitespace-pre-wrap">{post.content}</p>
              <div className="text-xs text-gray-500 mt-3">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          )
        })}

        {hasMore && !loading && (
          <div className="text-center">
            <button
              onClick={loadMore}
              className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer transition"
            >
              More posts →
            </button>
          </div>
        )}
      </div>
    )
  }
)

export default GlobalTimeline




