import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'

const SAMPLE_CSV = `account_name,campaign_name,landing_page,daily_budget,tactic,ad_type,keywords,geo_targets,age_ranges,gender,start_date,end_date
Acme Corp,Summer Sale Search,https://acme.com/summer,75,Search,Text Ad,buy shoes online;summer shoe sale;discount sneakers,"New York, NY;Los Angeles, CA;Chicago, IL","18-24;25-34;35-44",All,2025-07-01,2025-08-31
Acme Corp,Brand Awareness Display,https://acme.com/brand,40,Display,Responsive Display,,,"25-34;35-44;45-54",Female,2025-07-15,2025-09-15
Beta Media,Q3 Performance Max,https://betamedia.io/q3,120,Performance Max,Asset Group,performance max ads;pmax campaign,"United States","18-34",All,2025-07-01,2025-09-30`

const REQUIRED_COLUMNS = [
  'account_name','campaign_name','landing_page','daily_budget',
  'tactic','ad_type','keywords','geo_targets','age_ranges',
  'gender','start_date','end_date'
]

function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  return lines.slice(1).map((line, idx) => {
    const values = []
    let cur = '', inQ = false
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ }
      else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = '' }
      else cur += ch
    }
    values.push(cur.trim())
    const row = { _id: idx + 1 }
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row
  })
}

export default function Stage1Upload({ onNext }) {
  const [campaigns, setCampaigns] = useState([])
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  function processText(text) {
    setError('')
    try {
      const rows = parseCSV(text)
      const missing = REQUIRED_COLUMNS.filter(c => !Object.keys(rows[0] || {}).includes(c))
      if (missing.length) {
        setError(`Missing columns: ${missing.join(', ')}`)
        return
      }
      setCampaigns(rows)
    } catch {
      setError('Failed to parse CSV. Check the format and try again.')
    }
  }

  function handleFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => processText(e.target.result)
    reader.readAsText(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
      >
        <Upload className="mx-auto mb-3 text-gray-400" size={36} />
        <p className="text-gray-600 font-medium">Drag & drop a CSV file here, or click to browse</p>
        <p className="text-sm text-gray-400 mt-1">Supports standard campaign export formats</p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />
      </div>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-gray-200" />
        <span className="text-sm text-gray-400">or</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      <button
        onClick={() => processText(SAMPLE_CSV)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
      >
        <FileText size={18} />
        Load sample CSV (3 campaigns, 2 accounts)
      </button>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-700">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} loaded</p>
            <button onClick={() => setCampaigns([])} className="text-sm text-gray-400 hover:text-red-500">Clear</button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {['Account','Campaign','Landing Page','Budget','Tactic'].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{c.account_name}</td>
                    <td className="px-3 py-2">{c.campaign_name}</td>
                    <td className="px-3 py-2 text-blue-600 truncate max-w-[180px]">{c.landing_page}</td>
                    <td className="px-3 py-2">${c.daily_budget}/day</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{c.tactic}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="text-sm text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">CSV column reference</summary>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="font-mono text-xs text-gray-600 break-all">{REQUIRED_COLUMNS.join(', ')}</p>
            </div>
          </details>

          <button
            onClick={() => onNext(campaigns)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Continue to Configure →
          </button>
        </div>
      )}
    </div>
  )
}
