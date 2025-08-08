'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'

type ChirpBoxProps = {
  user: User
  onChirp?: () => void
}

const MAX_LINES = 5
const MAX_CHARS = 280
const LINE_HEIGHT = 24
const VERTICAL_PADDING = 24 // 12px top + 12px bottom
const MAX_HEIGHT = MAX_LINES * LINE_HEIGHT + VERTICAL_PADDING

const resizeTextarea = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto'
  const newHeight = Math.min(el.scrollHeight, MAX_HEIGHT)
  el.style.height = `${newHeight}px`
  if (el.scrollHeight > MAX_HEIGHT) {
    el.scrollTop = el.scrollHeight
  }
}

export default function ChirpBox({ user, onChirp }: ChirpBoxProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value
    const lines = raw.split('\n')

    if (lines.length > MAX_LINES) {
      const trimmed = lines.slice(0, MAX_LINES).join('\n')
      setContent(trimmed.slice(0, MAX_CHARS))
    } else {
      setContent(raw.slice(0, MAX_CHARS))
    }
  }

  const cleanContent = (text: string) => {
    return text.trim().replace(/\n{3,}/g, '\n\n')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleaned = cleanContent(content)

    if (!cleaned.replace(/\n/g, '').trim()) return

    try {
      setLoading(true)
      const { error } = await supabase.from('posts').insert([
        { content: cleaned, user_id: user.id },
      ])
      if (error) throw error

      toast.success('Chirp posted!')
      setContent('')
      onChirp?.()
      textareaRef.current?.focus()
    } catch (err: any) {
      toast.error('Failed to chirp: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const el = textareaRef.current
    if (el) resizeTextarea(el)
  }, [content])

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow mb-4 space-y-2"
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        rows={2}
        maxLength={MAX_CHARS}
        placeholder="What's happening?"
        className="w-full text-sm text-gray-800 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all box-border scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{
          lineHeight: `${LINE_HEIGHT}px`,
          maxHeight: `${MAX_HEIGHT}px`,
          padding: '12px',
          overflowY: 'auto',
          backgroundClip: 'padding-box',
          scrollPaddingTop: '12px',
          scrollbarWidth: 'thin', // Firefox
        }}
      />
      <div className="flex justify-between items-center">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-4 py-2 rounded-2xl shadow transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
        <span className="text-sm text-gray-400">
          {content.length}/{MAX_CHARS}
        </span>
      </div>
    </form>
  )
}
