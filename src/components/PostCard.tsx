'use client'

import { useMemo } from 'react'
import { AiFillHeart } from 'react-icons/ai'
import { FaRegCommentDots, FaShare, FaBookmark } from 'react-icons/fa'
import { FiTrash2 } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

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

type PostCardProps = {
  post: Post
  liked: boolean
  saved: boolean
  onLikeToggle: (postId: string) => void
  onSaveToggle: (postId: string) => void
  onDelete?: (postId: string) => void // ✅ optional delete prop
}

export default function PostCard({
  post,
  liked,
  saved,
  onLikeToggle,
  onSaveToggle,
  onDelete,
}: PostCardProps) {
  const username = useMemo(() => {
    return post.users?.username || post.users?.email || 'Unknown user'
  }, [post.users])

  const avatarUrl = useMemo(() => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      username
    )}`
  }, [username])

  const timestamp = useMemo(() => {
    return formatDistanceToNow(new Date(post.created_at), {
      addSuffix: true,
    })
  }, [post.created_at])

  const confirmDelete = (postId: string) => {
    toast(
      (t) => (
        <div className="text-white">
          <p className="mb-2">Delete this post?</p>
          <div className="flex justify-end gap-3">
            <button
              className="px-2 py-1 text-sm text-gray-300 hover:text-red-400 transition"
              onClick={async () => {
                toast.dismiss(t.id)
                onDelete?.(postId)
                toast.success('Post deleted')
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
      ),
      {
        duration: 4000,
        position: 'bottom-center',
        style: {
          background: '#1f1f1f',
          border: '1px solid #444',
          color: '#fff',
        },
      }
    )
  }

  return (
    <div className="p-6 rounded-xl bg-white text-black shadow-md shadow-black/10 border-t-2 border-solid border-gray-200 animate-fade-in break-words">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={`${username} avatar`}
            className="w-10 h-10 rounded-full shrink-0"
          />
          <span className="font-semibold break-all">{username}</span>
        </div>

        {onDelete && (
          <button
            onClick={() => confirmDelete(post.id)}
            className="text-gray-500 hover:text-red-500 transition cursor-pointer"
            title="Delete post"
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      <p className="whitespace-pre-wrap break-words">{post.content}</p>

      <div className="flex justify-between items-center mt-5 text-sm">
        <div className="flex gap-4">
          <button
            onClick={() => onLikeToggle(post.id)}
            className="flex items-center font-semibold cursor-pointer select-none transition group min-w-[58px]"
          >
            <AiFillHeart
              size={17}
              className={`transition-all duration-200 ease-in-out mr-1 ${
                liked
                  ? 'text-red-500 scale-110'
                  : 'text-gray-500 group-hover:text-red-500 group-hover:scale-110'
              }`}
            />
            <span
              className={`transition-all duration-200 ease-in-out ${
                liked
                  ? 'text-red-500'
                  : 'text-gray-500 group-hover:text-red-500'
              }`}
            >
              {liked ? 'Liked' : 'Like'}
            </span>
          </button>

          <button
            onClick={() => alert('Comment feature coming soon!')}
            className="flex items-center font-semibold cursor-pointer select-none transition group min-w-[102px]"
          >
            <FaRegCommentDots
              className="mr-1 transition-all duration-200 ease-in-out text-purple-600 group-hover:text-green-500 group-hover:scale-110"
              size={17}
            />
            <span className="transition-all duration-200 ease-in-out text-purple-600 group-hover:text-green-500">
              Comments
            </span>
          </button>

          <button
            onClick={() => alert('Share feature coming soon!')}
            className="flex items-center font-semibold cursor-pointer select-none transition group min-w-[68px]"
          >
            <FaShare
              className="mr-1 transition-all duration-200 ease-in-out text-purple-600 group-hover:text-green-500 group-hover:scale-110"
              size={17}
            />
            <span className="transition-all duration-200 ease-in-out text-purple-600 group-hover:text-green-500">
              Share
            </span>
          </button>

          <button
            onClick={() => onSaveToggle(post.id)}
            className="flex items-center font-semibold cursor-pointer select-none transition group min-w-[58px]"
          >
            <FaBookmark
              className={`mr-1 transition-all duration-200 ease-in-out ${
                saved
                  ? 'text-pink-500 scale-110'
                  : 'text-gray-500 group-hover:text-pink-500 group-hover:scale-110'
              }`}
              size={15}
            />
            <span
              className={`transition-all duration-200 ease-in-out ${
                saved
                  ? 'text-pink-500'
                  : 'text-pink-500 group-hover:text-pink-500'
              }`}
            >
              {saved ? 'Saved' : 'Save'}
            </span>
          </button>
        </div>

        <div className="text-xs text-gray-500">{timestamp}</div>
      </div>
    </div>
  )
}
