'use client'

import { useMemo } from 'react'
import { AiFillHeart } from 'react-icons/ai'
import { FaRegCommentDots, FaShare, FaBookmark } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'

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
}

export default function PostCard({
  post,
  liked,
  saved,
  onLikeToggle,
  onSaveToggle,
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

  return (
    <div className="p-6 rounded-xl bg-white text-black shadow-md shadow-black/10 border-t-2 border-solid border-gray-200 animate-fade-in break-words">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={avatarUrl}
          alt={`${username} avatar`}
          className="w-10 h-10 rounded-full shrink-0"
        />
        <span className="font-semibold break-all">{username}</span>
      </div>

      <p className="whitespace-pre-wrap break-words">{post.content}</p>

      <div className="flex justify-between items-center mt-4 text-sm">
        <div className="flex gap-4">
          <button
            onClick={() => onLikeToggle(post.id)}
            className="flex items-center gap-1 font-semibold cursor-pointer select-none transition group min-w-[58px]"
          >
            <AiFillHeart
              size={18}
              className={`transition ${
                liked
                  ? 'text-red-500'
                  : 'text-gray-500 group-hover:text-red-500'
              }`}
            />
            <span
              className={`transition ${
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
            className="flex items-center gap-1 font-semibold cursor-pointer select-none transition group min-w-[100px]"
          >
            <FaRegCommentDots className="transition text-purple-600 group-hover:text-green-500" />
            <span className="transition text-purple-600 group-hover:text-green-500">
              Comments
            </span>
          </button>

          <button
            onClick={() => alert('Share feature coming soon!')}
            className="flex items-center gap-1 font-semibold cursor-pointer select-none transition group min-w-[64px]"
          >
            <FaShare className="transition text-purple-600 group-hover:text-green-500" />
            <span className="transition text-purple-600 group-hover:text-green-500">
              Share
            </span>
          </button>

          <button
            onClick={() => onSaveToggle(post.id)}
            className="flex items-center gap-1 font-semibold cursor-pointer select-none transition group min-w-[58px]"
          >
            <FaBookmark
              className={`transition ${
                saved
                  ? 'text-red-500'
                  : 'text-gray-500 group-hover:text-red-500'
              }`}
            />
            <span
              className={`transition ${
                saved
                  ? 'text-red-500'
                  : 'text-gray-500 group-hover:text-red-500'
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

















