'use client'

import { useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const galleryImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
]

export default function Gallery() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const imageWidth = 224 // 220px + 4px gap

  const scrollLeftClick = () => {
    scrollRef.current?.scrollBy({ left: -imageWidth, behavior: 'smooth' })
  }

  const scrollRightClick = () => {
    scrollRef.current?.scrollBy({ left: imageWidth, behavior: 'smooth' })
  }

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    isDragging.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.2 // scroll speed
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  const onMouseUp = () => {
    isDragging.current = false
  }

  return (
    <div className="relative flex items-center h-full w-full overflow-hidden select-none">
      {/* Left Arrow */}
      <button
        onClick={scrollLeftClick}
        aria-label="Scroll Left"
        className="absolute left-2 z-10 p-2 backdrop-blur-sm bg-black/30 text-white rounded-full shadow hover:bg-black/50 transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      {/* Images Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 h-full px-10 pb-2 no-scrollbar cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseUp}
        onMouseUp={onMouseUp}
      >
        {galleryImages.map((url, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 rounded-xl shadow-inner"
            style={{
              width: 220,
              height: '100%',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.15)',
            }}
          >
            <img
              src={url}
              alt={`Gallery ${idx + 1}`}
              className="w-full h-full object-cover rounded-xl"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={scrollRightClick}
        aria-label="Scroll Right"
        className="absolute right-2 z-10 p-2 backdrop-blur-sm bg-black/30 text-white rounded-full shadow hover:bg-black/50 transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </div>
  )
}
