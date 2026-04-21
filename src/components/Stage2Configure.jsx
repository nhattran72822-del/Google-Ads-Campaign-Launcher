import { useState } from 'react'
import { ChevronDown, ChevronUp, Tag, X, Trash2 } from 'lucide-react'

const TACTICS = ['Search','Display','Performance Max','Video','Shopping','Smart','Discovery']
const AD_TYPES = {
  Search: ['Text Ad','Responsive Search Ad'],
  Display: ['Responsive Display','Image Ad','HTML5 Ad'],
  'Performance Max': ['Asset Group'],
  Video: ['Skippable In-Stream','Non-Skippable','Bumper','Video Discovery'],
  Shopping: ['Standard Shopping','Smart Shopping'],
  Smart: ['Smart Campaign'],
  Discovery: ['Discovery Ad'],
}
const AGE_RANGES = ['18-24','25-34','35-44','45-54','55-64','65+']
const GENDERS = ['All','Male','Female','Unknown']

function KeywordInput({ value, onChange }) {
  const [input, setInput] = useState('')
  const tags = value ? value.split(';').filter(Boolean) : []

  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const next = [...new Set([...tags, input.trim()])]
      onChange(next.join(';'))
      setInput('')
    }
  }

  function removeTag(t) {
    onChange(tags.filter(k => k !== t).join(';'))
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
          <Tag size={10} />{t}
          <button onClick={() => removeTag(t)} className="ml-0.5 hover:text-red-600"><X size={10} /></button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        placeholder={tags.length === 0 ? 'Type keyword and press Enter' : 'Add more...'}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={addTag}
      />
    </div>
  )
}

function GeoInput({ value, onChange }) {
  const [input, setInput] = useState('')
  const tags = value ? value.split(';').filter(Boolean) : []

  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const next = [...new Set([...tags, input.trim()])]
      onChange(next.join(';'))
      setInput('')
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
          {t}
          <button onClick={() => onChange(tags.filter(g => g !== t).join(';'))} className="ml-0.5 hover:text-red-600"><X size={10} /></button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        placeholder={tags.length === 0 ? 'City, State or Country — press Enter' : 'Add more...'}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={addTag}
      />
    </div>
  )
}

function CampaignCard({ campaign, onChange, onDelete, index }) {
  const [open, setOpen] = useState(index === 0)

  function set(field, val) {
    onChange({ ...campaign, [field]: val })
  }

  function toggleAge(age) {
    const ages = campaign.age_ranges ? campaign.age_ranges.split(';').filter(Boolean) : []
    const next = ages.includes(age) ? ages.filter(a => a !== age) : [...ages, age]
    set('age_ranges', next.join(';'))
  }

  const ages = campaign.age_ranges ? campaign.age_ranges.split(';').filter(Boolean) : []
  const adTypes = AD_TYPES[campaign.tactic] || ['Text Ad']

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{index + 1}</span>
          <div>
            <p className="font-semibold text-gray-800">{campaign.campaign_name || 'Untitled Campaign'}</p>
            <p className="text-xs text-gray-500">{campaign.account_name} · {campaign.tactic}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove campaign"
          >
            <Trash2 size={16} />
          </button>
          {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Account Name">
            <input className="input" value={campaign.account_name} onChange={e => set('account_name', e.target.value)} />
          </Field>
          <Field label="Campaign Name">
            <input className="input" value={campaign.campaign_name} onChange={e => set('campaign_name', e.target.value)} />
          </Field>
          <Field label="Landing Page URL" className="md:col-span-2">
            <input className="input" type="url" value={campaign.landing_page} onChange={e => set('landing_page', e.target.value)} />
          </Field>
          <Field label="Daily Budget ($)">
            <input className="input" type="number" min="1" value={campaign.daily_budget} onChange={e => set('daily_budget', e.target.value)} />
          </Field>
          <Field label="Tactic">
            <select className="input" value={campaign.tactic} onChange={e => { set('tactic', e.target.value); set('ad_type', AD_TYPES[e.target.value]?.[0] || '') }}>
              {TACTICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Ad Type">
            <select className="input" value={campaign.ad_type} onChange={e => set('ad_type', e.target.value)}>
              {adTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Start Date">
            <input className="input" type="date" value={campaign.start_date} onChange={e => set('start_date', e.target.value)} />
          </Field>
          <Field label="End Date">
            <input className="input" type="date" value={campaign.end_date} onChange={e => set('end_date', e.target.value)} />
          </Field>
          <Field label="Keywords (Enter to add)" className="md:col-span-2">
            <KeywordInput value={campaign.keywords} onChange={v => set('keywords', v)} />
          </Field>
          <Field label="Geographic Targets (Enter to add)" className="md:col-span-2">
            <GeoInput value={campaign.geo_targets} onChange={v => set('geo_targets', v)} />
          </Field>
          <Field label="Age Ranges" className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              {AGE_RANGES.map(age => (
                <button
                  key={age}
                  onClick={() => toggleAge(age)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors
                    ${ages.includes(age) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
                >{age}</button>
              ))}
            </div>
          </Field>
          <Field label="Gender">
            <div className="flex gap-3">
              {GENDERS.map(g => (
                <label key={g} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                  <input type="radio" name={`gender-${campaign._id}`} value={g}
                    checked={campaign.gender === g} onChange={() => set('gender', g)} className="accent-blue-600" />
                  {g}
                </label>
              ))}
            </div>
          </Field>
        </div>
      )}
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

export default function Stage2Configure({ campaigns: initial, onBack, onNext }) {
  const [campaigns, setCampaigns] = useState(initial)

  function update(idx, updated) {
    setCampaigns(prev => prev.map((c, i) => i === idx ? updated : c))
  }

  return (
    <div className="space-y-4">
      <style>{`.input { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; background: white; } .input:focus { ring: 2px solid #3b82f6; border-color: transparent; box-shadow: 0 0 0 2px #3b82f6; }`}</style>
      {campaigns.map((c, i) => (
        <CampaignCard
          key={c._id}
          campaign={c}
          onChange={u => update(i, u)}
          onDelete={() => setCampaigns(prev => prev.filter((_, idx) => idx !== i))}
          index={i}
        />
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">← Back</button>
        <button onClick={() => onNext(campaigns)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">Continue to AI Validate →</button>
      </div>
    </div>
  )
}
