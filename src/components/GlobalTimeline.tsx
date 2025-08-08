'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { usePostContext } from '@/context/PostProvider'
import PostCard from './PostCard'
import LoadingSpinner from './LoadingSpinner'

export default function GlobalTimeline() {
  const {
    posts,
    loading,
    fetchNextPage,
    hasMore,
    likedPostIds,
    savedPostIds,
    toggleLike,
    toggleSave,
    deletePost,
    user,
  } = usePostContext()

  const [localPosts, setLocalPosts] = useState(posts) // ✅ Local state for instant updates

  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loading) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasMore, loading]
  )

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(handleObserver)

    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current)
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [localPosts, handleObserver])

  // ✅ Sync localPosts whenever posts from context change
  useEffect(() => {
    setLocalPosts(posts)
  }, [posts])

  // ✅ Wait until user is loaded before rendering
  if (!user) return null

  const handleDelete = async (postId: string) => {
    await deletePost(postId)
    setLocalPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  return (
    <div className="space-y-4 pb-20">
      {!loading && localPosts.length === 0 && (
        <p className="text-gray-500 text-sm">There are no posts to display.</p>
      )}

      {localPosts.map((post, idx) => {
        const isLast = idx === localPosts.length - 1
        const isUserPost = post.user_id === user.id

        return (
          <div
            key={post.id}
            ref={isLast ? lastPostRef : null}
            className="fade-in"
          >
            <PostCard
              post={post}
              liked={likedPostIds.includes(post.id)}
              saved={savedPostIds.includes(post.id)}
              onLikeToggle={(postId) => toggleLike(postId)}
              onSaveToggle={(postId) => toggleSave(postId)}
              {...(isUserPost && {
                onDelete: (postId) => handleDelete(postId),
              })}
            />
          </div>
        )
      })}

      {loading && <LoadingSpinner />}
    </div>
  )
}

