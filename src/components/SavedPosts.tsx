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

export type SavedPostsHandle = {
  refetch: () => void
}

const PAGE_SIZE = 3

const SavedPosts = forwardRef((props: { user: any }, ref: Ref<SavedPostsHandle>) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})

  const fetchSavedPosts = async (pageToFetch = 1) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          posts (
            id,
            content,
            created_at,
            user_id,
            users (
              email,
              username
            )
          )
        `)
        .eq('user_id', props.user.id)
        .order('created_at', { ascending: false })
        .range((pageToFetch - 1) * PAGE_SIZE, pageToFetch * PAGE_SIZE - 1)

      if (error) throw error

      const mappedPosts = (data || [])
        .map((item: any) => {
          const post = item.posts
          if (!post) return null
          return {
            ...post,
            users: post.users,
          }
        })
        .filter((p: Post | null) => p !== null) as Post[]

      console.log('Fetched saved posts:', mappedPosts) // <-- Debug

      if (pageToFetch === 1) {
        setPosts(mappedPosts)
      } else {
        setPosts((prev) => [...prev, ...mappedPosts])
      }

      setHasMore(mappedPosts.length === PAGE_SIZE)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    refetch: () => {
      setPage(1)
      fetchSavedPosts(1)
    },
  }))

  useEffect(() => {
    setPage(1)
    fetchSavedPosts(1)

    const subscription = supabase
      .channel('public:saved_posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'saved_posts' },
        () => fetchSavedPosts(1)
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
    fetchSavedPosts(nextPage)
  }

  const toggleExpanded = (id: string) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Defensive check for empty posts array
  const noPostsToShow = !loading && (posts.length === 0)

  return (
    <div className="space-y-4">
      {loading && posts.length === 0 && (
        <p className="text-center p-4 text-white">Loading posts...</p>
      )}
      {error && <p className="text-center p-4 text-red-300">Error: {error}</p>}

      {noPostsToShow && (
        <p className="text-center text-gray-500 text-sm">
          You have no saved posts.
        </p>
      )}

      {posts.map((post) => {
        const username =
          post.users?.username || post.users?.email || 'Unknown user'
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
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
                'relative text-sm transition-all duration-500 ease-in-out overflow-hidden break-words whitespace-pre-wrap',
                isExpanded ? 'max-h-[1000px]' : 'max-h-[5.5rem]'
              )}
            >
              <p className="break-words whitespace-pre-wrap">{post.content}</p>
              {!isExpanded && isLong && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
              )}
            </div>

            <div className="mt-2 flex justify-between items-center">
              {isLong && (
                <button
                  onClick={() => toggleExpanded(post.id)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-opacity duration-700 ease-in cursor-pointer"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </span>
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

SavedPosts.displayName = 'SavedPosts'
export default SavedPosts









