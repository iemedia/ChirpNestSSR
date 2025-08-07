'use client'

import { useEffect, useRef, useCallback } from 'react'
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
  } = usePostContext()

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
  }, [posts, handleObserver])

  return (
    <div className="space-y-4 pb-20">
      {posts.map((post, idx) => {
        const isLast = idx === posts.length - 1

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
              onLike={() => toggleLike(post.id)}
              onSave={() => toggleSave(post.id)}
              onDelete={() => deletePost(post.id)}
            />
          </div>
        )
      })}
      {loading && <LoadingSpinner />}
    </div>
  )
}









