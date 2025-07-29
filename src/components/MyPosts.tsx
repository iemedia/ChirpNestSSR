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
import clsx from 'clsx'

type Post = {
  id: string
  content: string
  created_at: string
  user_id: string
  users?: {
    email?: string
    username?: string
  }
}

export type MyPostsHandle = {
  refetch: () => void
}

const PAGE_SIZE = 3

const MyPosts = forwardRef((props: { user: any }, ref: Ref<MyPostsHandle>) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})

  const fetchPosts = async (pageToFetch = 1) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          users!posts_user_id_fkey (
            email,
            username
          )
        `)
        .eq('user_id', props.user.id)
        .order('created_at', { ascending: false })
        .range((pageToFetch - 1) * PAGE_SIZE, pageToFetch * PAGE_SIZE - 1)

      if (error) throw error

      if (pageToFetch === 1) {
        setPosts(data || [])
      } else {
        setPosts((prev) => [...prev, ...(data || [])])
      }

      setHasMore(data && data.length === PAGE_SIZE)
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

    const subscription = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchPosts(1)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [props.user?.id])

  const loadMore = () => {
    if (loading) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage)
  }

  const toggleExpanded = (id: string) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (loading && posts.length === 0)
    return <p className="text-center p-4 text-white">Loading posts...</p>
  if (error)
    return <p className="text-center p-4 text-red-300">Error: {error}</p>

  return (
    <div className="space-y-4">
      {posts.length === 0 && !loading && (
        <p className="text-center text-white">No posts yet.</p>
      )}

      {posts.map((post) => {
        const username =
          post.users?.username || post.users?.email || 'Unknown user'
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          username
        )}`

        const isLong = post.content.length > 140
        const isExpanded = expandedPosts[post.id]

        return (
          <div
            key={post.id}
            className="p-6 rounded-xl bg-gray-900 text-gray-100 shadow-md shadow-black/20 animate-fade-in"
          >
            <div className="flex items-center gap-2 mb-4">
              <img
                src={avatarUrl}
                alt={`${username} avatar`}
                className="w-6 h-6 rounded-full"
                loading="lazy"
              />
              <span className="text-white font-semibold">{username}</span>
            </div>

            <div
              className={clsx(
                'relative text-sm overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out',
                isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-[5.5rem] opacity-95'
              )}
            >
              <p className="whitespace-pre-wrap">{post.content}</p>
              {!isExpanded && isLong && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
              )}
            </div>

            {isLong && (
              <button
                onClick={() => toggleExpanded(post.id)}
                className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-opacity duration-700 ease-in cursor-pointer"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}

            <div className="text-xs text-gray-400 mt-4">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
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
})

export default MyPosts



