'use client'

import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
  useCallback,
} from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import { PostSchema } from '@/schemas/post'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FiTrash2 } from 'react-icons/fi'

const PAGE_SIZE = 3

type Post = z.infer<typeof PostSchema>

export type MyPostsHandle = {
  refetch: () => void
}

const MyPosts = forwardRef((props: { user: any }, ref: Ref<MyPostsHandle>) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})
  const [fadingOut, setFadingOut] = useState<string | null>(null)

  const fetchPosts = useCallback(async (pageToFetch = 1) => {
    setLoading(true)
    setError(null)
    try {
      const rangeFrom = (pageToFetch - 1) * PAGE_SIZE
      const rangeTo = pageToFetch * PAGE_SIZE - 1

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          users (
            id,
            username,
            email
          )
        `
        )
        .eq('user_id', props.user.id)
        .order('created_at', { ascending: false })
        .range(rangeFrom, rangeTo)

      if (error) throw error

      const parsed = z.array(PostSchema).safeParse(data)
      if (!parsed.success) throw new Error('Invalid post data from Supabase')

      if (pageToFetch === 1) {
        setPosts(parsed.data)
      } else {
        setPosts((prev) => [...prev, ...parsed.data])
      }

      setHasMore(parsed.data.length === PAGE_SIZE)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [props.user.id])

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
  }, [fetchPosts])

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

  const confirmDelete = (postId: string) => {
    toast((t) => (
      <div className="text-white">
        <p className="mb-2">Delete this post?</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-2 py-1 text-sm text-gray-300 hover:text-red-400 transition"
            onClick={async () => {
              toast.dismiss(t.id)
              setFadingOut(postId)
              setTimeout(async () => {
                const { error } = await supabase.from('posts').delete().eq('id', postId)
                if (error) {
                  toast.error('Failed to delete post.')
                } else {
                  toast.success('Post deleted')
                  fetchPosts(1)
                }
                setFadingOut(null)
              }, 300) // match fade-out duration
            }}
          >
            Yes
          </button>
          <button
            className="px-2 py-1 text-sm text-gray-400 hover:text-gray-200 transition"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 4000,
      position: 'bottom-center',
      style: {
        background: '#1f1f1f',
        border: '1px solid #444',
        color: '#fff',
      },
    })
  }

  return (
    <div className="space-y-4">
      {loading && posts.length === 0 && (
        <p className="text-center p-4 text-white">Loading posts...</p>
      )}
      {error && <p className="text-center p-4 text-red-300">Error: {error}</p>}

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
        const isFadingOut = fadingOut === post.id

        return (
          <div
            key={post.id}
            className={clsx(
              'p-6 rounded-xl bg-gray-900 text-gray-100 shadow-md shadow-black/20 transition-opacity duration-300 ease-in-out animate-fade-in',
              isFadingOut && 'opacity-0 pointer-events-none'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img
                  src={avatarUrl}
                  alt={`${username} avatar`}
                  className="w-6 h-6 rounded-full"
                  loading="lazy"
                />
                <span className="text-white font-semibold">{username}</span>
              </div>
              <button
                onClick={() => confirmDelete(post.id)}
                className="text-gray-500 hover:text-red-500 transition"
                title="Delete post"
              >
                <FiTrash2 size={16} />
              </button>
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

export default MyPosts














