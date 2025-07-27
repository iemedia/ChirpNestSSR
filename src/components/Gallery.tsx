'use client'

import { useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const galleryImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&w=600&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
]

export default function Gallery() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const imageWidth = 224

  const scrollLeftClick = () => {
    scrollRef.current?.scrollBy({ left: -imageWidth, behavior: 'smooth' })
  }

  const scrollRightClick = () => {
    scrollRef.current?.scrollBy({ left: imageWidth, behavior: 'smooth' })
  }

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
    const walk = (x - startX.current) * 1.2
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  const onMouseUp = () => {
    isDragging.current = false
  }

  return (
    <div className="relative h-full w-full select-none flex items-center overflow-hidden">
      {/* Arrows */}
      <div className="absolute inset-0 flex justify-between items-center z-10 pointer-events-none">
        <button
          onClick={scrollLeftClick}
          aria-label="Scroll Left"
          className="pointer-events-auto p-2 text-white hover:text-purple-400 transition"
        >
          <ChevronLeftIcon className="w-10 h-10 cursor-pointer" />
        </button>
        <button
          onClick={scrollRightClick}
          aria-label="Scroll Right"
          className="pointer-events-auto p-2 text-white hover:text-purple-400 transition"
        >
          <ChevronRightIcon className="w-10 h-10 cursor-pointer" />
        </button>
      </div>

      {/* Scrollable images */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 h-full no-scrollbar cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseUp}
        onMouseUp={onMouseUp}
      >
        {galleryImages.map((url, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-[220px] h-full rounded-xl shadow-inner"
            style={{
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
    </div>
  )
}
