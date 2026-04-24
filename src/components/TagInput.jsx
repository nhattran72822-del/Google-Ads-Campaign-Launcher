import { useState } from 'react'

export default function TagInput({ tags = [], onChange, placeholder = 'Type + Enter…' }) {
  const [input, setInput] = useState('')

  function addTag(e) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()])
      setInput('')
    }
  }

  return (
    <div className="tag-inp-wrap" onClick={e => e.currentTarget.querySelector('input')?.focus()}>
      {tags.map((t, i) => (
        <span key={i} className="tag">
          {t}
          <span className="tx" onClick={ev => { ev.stopPropagation(); onChange(tags.filter((_, idx) => idx !== i)) }}>×</span>
        </span>
      ))}
      <input
        className="tag-inp"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={addTag}
        placeholder={tags.length === 0 ? placeholder : ''}
      />
    </div>
  )
}
