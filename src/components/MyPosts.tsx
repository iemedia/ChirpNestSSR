'use client'

import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
} from 'react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import { usePostContext } from '@/context/PostProvider'
import toast from 'react-hot-toast'
import { FiTrash2 } from 'react-icons/fi'

export type MyPostsHandle = {
  refetch: () => void
}

const PAGE_SIZE = 3

const MyPosts = forwardRef((props: { user: any }, ref: Ref<MyPostsHandle>) => {
  const {
    posts,
    loading,
    hasMore,
    fetchNextPage,
    refetchPosts,
    deletePost,
  } = usePostContext()

  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})
  const [fadingOut, setFadingOut] = useState<string | null>(null)

  // Local pagination count (simulate load 3 posts at a time)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  // Filter posts by user
  const myPosts = posts.filter((post) => post.user_id === props.user.id)

  useImperativeHandle(ref, () => ({
    refetch: () => {
      refetchPosts()
      setDisplayCount(PAGE_SIZE) // reset display count on refetch
    },
  }))

  useEffect(() => {
    refetchPosts()
    setDisplayCount(PAGE_SIZE)
  }, [refetchPosts])

  const loadMore = () => {
    // First load more locally if available
    if (displayCount < myPosts.length) {
      setDisplayCount((prev) => prev + PAGE_SIZE)
    } else if (hasMore && !loading) {
      // Otherwise fetch next global page if available
      fetchNextPage()
    }
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
                await deletePost(postId)
                toast.success('Post deleted')
                refetchPosts()
                setFadingOut(null)

                // Adjust displayCount downwards on delete
                setDisplayCount((current) => {
                  const newCount = current - 1
                  return newCount >= PAGE_SIZE ? newCount : PAGE_SIZE
                })
              }, 300)
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
      {loading && myPosts.length === 0 && (
        <p className="text-center text-gray-500 text-sm">Loading posts...</p>
      )}

      {myPosts.length === 0 && !loading && (
        <p className="text-center text-gray-500 text-sm">
          You don&apos;t have any posts yet.
        </p>
      )}

      {myPosts.slice(0, displayCount).map((post) => {
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
                className="text-gray-500 hover:text-red-500 transition cursor-pointer"
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

      {(displayCount < myPosts.length || (hasMore && !loading)) && !loading && (
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






















