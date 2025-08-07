'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { toast } from 'react-hot-toast'
import { PostUser, PostUserSchema } from '@/schemas/post'
import { supabase } from '@/lib/supabaseClient'

interface PostContextProps {
  posts: PostUser[]
  loading: boolean
  fetchNextPage: () => void
  hasMore: boolean
  likedPostIds: string[]
  savedPostIds: string[]
  toggleLike: (postId: string) => void
  toggleSave: (postId: string) => void
  deletePost: (postId: string) => void
}

const PostContext = createContext<PostContextProps | undefined>(undefined)

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<PostUser[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [likedPostIds, setLikedPostIds] = useState<string[]>([])
  const [savedPostIds, setSavedPostIds] = useState<string[]>([])
  const PAGE_SIZE = 10
  const hasFetchedRef = useRef(false)

  function deduplicatePosts(posts: PostUser[]) {
    const seen = new Set<string>()
    return posts.filter((post) => {
      if (seen.has(post.id)) return false
      seen.add(post.id)
      return true
    })
  }

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*, users(*)')
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      setLoading(false)
      return
    }

    const validated = PostUserSchema.array().safeParse(data)
    if (validated.success) {
      setPosts(deduplicatePosts(validated.data))
      setHasMore(validated.data.length === PAGE_SIZE)
      setPage(0)
    }
    setLoading(false)
  }, [])

  const fetchNextPage = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const from = (page + 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('posts')
      .select('*, users(*)')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Pagination error:', error)
      setLoading(false)
      return
    }

    const validated = PostUserSchema.array().safeParse(data)
    if (validated.success) {
      if (validated.data.length > 0) {
        setPosts((prev) => deduplicatePosts([...prev, ...validated.data]))
        setPage((prev) => prev + 1)
      }
      if (validated.data.length < PAGE_SIZE) {
        setHasMore(false)
      }
    }
    setLoading(false)
  }, [page, hasMore, loading])

  const handleRealtimeInserts = (newPost: PostUser) => {
    setPosts((prev) => {
      const updated = deduplicatePosts([newPost, ...prev])
      return updated
    })
    toast('✨ New post received')
  }

  const handleRealtimeUpdates = (updatedPost: PostUser) => {
    setPosts((prev) => {
      const filtered = prev.filter((p) => p.id !== updatedPost.id)
      return deduplicatePosts([updatedPost, ...filtered])
    })
  }

  const handleRealtimeDeletes = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== deletedPostId))
  }

  const subscribeToRealtime = () => {
    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          const newId = payload.new.id as string

          const { data, error } = await supabase
            .from('posts')
            .select('*, users(*)')
            .eq('id', newId)
            .single()

          if (error) {
            console.error('Failed to fetch full post on insert:', error)
            return
          }

          const validated = PostUserSchema.safeParse(data)
          if (validated.success) {
            handleRealtimeInserts(validated.data)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          const validated = PostUserSchema.safeParse(payload.new)
          if (validated.success) {
            handleRealtimeUpdates(validated.data)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          const deletedPostId = payload.old.id as string
          handleRealtimeDeletes(deletedPostId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const toggleLike = async (postId: string) => {
    const alreadyLiked = likedPostIds.includes(postId)
    if (alreadyLiked) {
      await supabase.from('likes').delete().match({ post_id: postId })
      setLikedPostIds((prev) => prev.filter((id) => id !== postId))
    } else {
      await supabase.from('likes').insert({ post_id: postId })
      setLikedPostIds((prev) => [...prev, postId])
    }
  }

  const toggleSave = async (postId: string) => {
    const alreadySaved = savedPostIds.includes(postId)
    if (alreadySaved) {
      await supabase.from('saved_posts').delete().match({ post_id: postId })
      setSavedPostIds((prev) => prev.filter((id) => id !== postId))
    } else {
      await supabase.from('saved_posts').insert({ post_id: postId })
      setSavedPostIds((prev) => [...prev, postId])
    }
  }

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      toast.error('Failed to delete post')
    }
  }

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchPosts()
      hasFetchedRef.current = true
    }
    const unsubscribe = subscribeToRealtime()
    return () => unsubscribe()
  }, [fetchPosts])

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        fetchNextPage,
        hasMore,
        likedPostIds,
        savedPostIds,
        toggleLike,
        toggleSave,
        deletePost,
      }}
    >
      {children}
    </PostContext.Provider>
  )
}

export function usePostContext() {
  const context = useContext(PostContext)
  if (!context) {
    throw new Error('usePostContext must be used within a PostProvider')
  }
  return context
}
