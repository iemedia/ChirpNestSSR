'use client'

import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
} from 'react'
import { supabase } from '@/lib/supabaseClient'
import PostCard from './PostCard'

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
    const [likesMap, setLikesMap] = useState<Record<string, boolean>>({})
    const [savedMap, setSavedMap] = useState<Record<string, boolean>>({})

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

    const fetchLikes = async () => {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)

      if (error) return

      const likedPosts = data?.reduce<Record<string, boolean>>((acc, like) => {
        acc[like.post_id] = true
        return acc
      }, {}) || {}

      setLikesMap(likedPosts)
    }

    const fetchSaved = async () => {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', user.id)

      if (error) return

      const savedPosts = data?.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.post_id] = true
        return acc
      }, {}) || {}

      setSavedMap(savedPosts)
    }

    useImperativeHandle(ref, () => ({
      refetch: () => {
        setPage(1)
        fetchPosts(1)
        fetchLikes()
        fetchSaved()
      },
    }))

    useEffect(() => {
      setPage(1)
      fetchPosts(1)
      fetchLikes()
      fetchSaved()

      const channel = supabase
        .channel('public:posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          () => {
            fetchPosts(1)
            fetchLikes()
            fetchSaved()
          }
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

    const toggleLike = async (postId: string) => {
      if (!user?.id) return
      const isLiked = likesMap[postId]

      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, post_id: postId })

        if (!error) {
          setLikesMap((prev) => ({ ...prev, [postId]: false }))
        }
      } else {
        const { error } = await supabase.from('likes').insert({
          user_id: user.id,
          post_id: postId,
        })

        if (!error) {
          setLikesMap((prev) => ({ ...prev, [postId]: true }))
        }
      }
    }

    const toggleSave = async (postId: string) => {
      if (!user?.id) return
      const isSaved = savedMap[postId]

      if (isSaved) {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .match({ user_id: user.id, post_id: postId })

        if (!error) {
          setSavedMap((prev) => ({ ...prev, [postId]: false }))
        }
      } else {
        const { error } = await supabase.from('saved_posts').insert([
          {
            user_id: user.id,
            post_id: postId,
          },
        ])

        if (!error) {
          setSavedMap((prev) => ({ ...prev, [postId]: true }))
        }
      }
    }

    if (loading && posts.length === 0)
      return <p className="text-center p-4 text-black">Loading posts...</p>
    if (error)
      return <p className="text-center p-4 text-red-600">Error: {error}</p>

    return (
      <div className="space-y-4 break-words overflow-x-hidden">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-black">What's Happening</h2>
          <div className="flex gap-6">
            <button
              className={`text-sm font-semibold transition cursor-pointer pb-1 ${
                filter === 'everyone'
                  ? 'text-black border-b-2 border-purple-500'
                  : 'text-gray-500 hover:text-black'
              }`}
              onClick={() => {
                setPage(1)
                setFilter('everyone')
              }}
            >
              Everyone
            </button>
            <button
              className={`text-sm font-semibold transition cursor-pointer pb-1 ${
                filter === 'following'
                  ? 'text-black border-b-2 border-purple-500'
                  : 'text-gray-500 hover:text-black'
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

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={likesMap[post.id]}
            saved={savedMap[post.id]}
            onLikeToggle={toggleLike}
            onSaveToggle={toggleSave}
          />
        ))}

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












