'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

type ChirpBoxProps = {
  user: User
  onChirp?: () => void
}

export default function ChirpBox({ user, onChirp }: ChirpBoxProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)

    const { error } = await supabase.from('tweets').insert([
      {
        content,
        user_id: user.id,
      },
    ])

    setLoading(false)

    if (!error) {
      setContent('')
      onChirp?.()
      textareaRef.current?.focus()
    } else {
      alert('Error posting chirp: ' + error.message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow mb-4 space-y-2"
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={280}
        placeholder="What's happening?"
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 focus:ring-purple-500 focus:ring-offset-2"
      />
      <div className="flex justify-between items-center">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-4 py-2 rounded-2xl shadow cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {loading ? 'Chirping...' : 'Chirp'}
        </button>
        <span className="text-sm text-gray-400">{content.length}/280</span>
      </div>
    </form>
  )
}
