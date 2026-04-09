import { useState } from 'react'
import { VIDEO_CATEGORIES } from '../../config/constants'

export default function CategoryFilter({ onSelect }) {
  const [active, setActive] = useState('0')

  const handleSelect = (id) => {
    setActive(id)
    onSelect(id)
  }

  return (
    <div className="flex items-center gap-3 px-6 py-3 overflow-x-auto hide-scrollbar sticky top-14 bg-yt-bg z-40">
      {VIDEO_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
            ${active === cat.id
              ? 'bg-yt-text text-yt-bg'
              : 'bg-yt-bg3 text-yt-text hover:bg-yt-hover'
            }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
