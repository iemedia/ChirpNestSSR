'use client'

import { useMemo } from 'react'
import { FaThumbsUp, FaThumbsDown, FaRegCommentDots, FaShare, FaAward, FaHeart } from 'react-icons/fa'
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
  upvoted: boolean
  downvoted: boolean
  saved: boolean
  liked: boolean                 // NEW liked prop
  onUpvoteToggle: (postId: string) => void
  onDownvoteToggle: (postId: string) => void
  onSaveToggle: (postId: string) => void
  onLikeToggle: (postId: string) => void // NEW like toggle callback
  onDelete?: (postId: string) => void
}

export default function PostCard({
  post,
  upvoted,
  downvoted,
  saved,
  liked,             // destructure liked
  onUpvoteToggle,
  onDownvoteToggle,
  onSaveToggle,
  onLikeToggle,      // destructure onLikeToggle
  onDelete,
}: PostCardProps) {
  const username = useMemo(() => {
    return post.users?.username || post.users?.email || 'Unknown user'
  }, [post.users])

  const avatarUrl = useMemo(() => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
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
        <div className="flex gap-1 items-center">
          {/* Upvote button with green border, flipped horizontally */}
          <button
            onClick={() => onUpvoteToggle(post.id)}
            title="Upvote"
            className={`cursor-pointer flex items-center justify-center w-7 h-7 rounded-md border-2 transition-all duration-200 ease-in-out 
              ${
                upvoted
                  ? 'border-green-500 bg-green-50 text-green-600 scale-110'
                  : 'border-green-400 text-green-500 hover:bg-green-100 hover:scale-110'
              }`}
          >
            <FaThumbsUp size={14} style={{ transform: 'scaleX(-1)' }} />
          </button>

          {/* Downvote button with purple border */}
          <button
            onClick={() => onDownvoteToggle(post.id)}
            title="Downvote"
            className={`mr-3 cursor-pointer flex items-center justify-center w-7 h-7 rounded-md border-2 transition-all duration-200 ease-in-out 
              
              ${
                downvoted
                  ? 'border-purple-600 bg-purple-100 text-purple-700 scale-110'
                  : 'border-purple-500 text-purple-600 hover:bg-purple-200 hover:scale-110'
              }`}
          >
            <FaThumbsDown size={14} />
          </button>

          {/* Like button - same styling as Save */}
          <button
            onClick={() => onLikeToggle(post.id)}
            className="mr-3 flex items-center font-semibold cursor-pointer select-none transition group"
          >
            <FaHeart
              className={`mr-1 transition-all duration-200 ease-in-out ${
                liked
                  ? 'text-pink-500 scale-110'
                  : 'text-pink-500 group-hover:text-pink-500 group-hover:scale-110'
              }`}
              size={15}
            />
            <span
              className={`transition-all duration-200 ease-in-out ${
                liked ? 'text-pink-500' : 'text-gray-500 group-hover:text-pink-500'
              }`}
            >
              {liked ? 'Liked' : 'Like'}
            </span>
          </button>

          {/* Save */}
          <button
            onClick={() => onSaveToggle(post.id)}
            className="mr-3 flex items-center font-semibold cursor-pointer select-none transition group"
          >
            <FaAward
              className={`mr-1 transition-all duration-200 ease-in-out ${
                saved
                  ? 'text-orange-500 scale-110'
                  : 'text-orange-500 group-hover:text-orange-500 group-hover:scale-110'
              }`}
              size={15}
            />
            <span
              className={`transition-all duration-200 ease-in-out ${
                saved
                  ? 'text-orange-500'
                  : 'text-gray-500 group-hover:text-orange-500'
              }`}
            >
              {saved ? 'Saved' : 'Save'}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => alert('Share feature coming soon!')}
            className="mr-3 flex items-center font-semibold cursor-pointer select-none transition group"
          >
            <FaShare
              className="mr-1 transition-all duration-200 ease-in-out text-purple-600 group-hover:text-purple-600 group-hover:scale-110"
              size={15}
            />
            <span className="transition-all duration-200 ease-in-out text-gray-500 group-hover:text-purple-600">
              Share
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={() => alert('Comment feature coming soon!')}
            className="flex items-center font-semibold cursor-pointer select-none transition group"
          >
            <FaRegCommentDots
              className="mr-1 transition-all duration-200 ease-in-out text-purple-600 group-hover:text-purple-600 group-hover:scale-110"
              size={15}
            />
            <span className="transition-all duration-200 ease-in-out text-gray-500 group-hover:text-purple-600">
              Comments
            </span>
          </button>
        </div>

        <div className="text-xs text-gray-500">{timestamp}</div>
      </div>
    </div>
  )
}
