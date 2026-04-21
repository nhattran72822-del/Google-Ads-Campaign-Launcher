import { useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Loader, Key } from 'lucide-react'

const STATUS = { ok: 'ok', warn: 'warn', err: 'err' }

function localValidate(campaign) {
  const issues = []
  if (!campaign.landing_page || !campaign.landing_page.startsWith('http'))
    issues.push({ status: STATUS.err, msg: 'Missing or invalid landing page URL' })
  if (!campaign.daily_budget || Number(campaign.daily_budget) < 5)
    issues.push({ status: STATUS.err, msg: 'Daily budget is below minimum ($5)' })
  if (campaign.tactic === 'Search' && (!campaign.keywords || campaign.keywords.split(';').filter(Boolean).length === 0))
    issues.push({ status: STATUS.err, msg: 'Search campaigns require at least one keyword' })
  if (!campaign.geo_targets || campaign.geo_targets.split(';').filter(Boolean).length === 0)
    issues.push({ status: STATUS.warn, msg: 'No geographic targets set — campaign will target globally' })
  if (!campaign.age_ranges || campaign.age_ranges.split(';').filter(Boolean).length === 0)
    issues.push({ status: STATUS.warn, msg: 'No age ranges selected — will target all ages' })
  if (!campaign.start_date)
    issues.push({ status: STATUS.warn, msg: 'No start date set' })
  if (!campaign.end_date)
    issues.push({ status: STATUS.warn, msg: 'No end date set' })
  if (campaign.start_date && campaign.end_date && campaign.start_date >= campaign.end_date)
    issues.push({ status: STATUS.err, msg: 'End date must be after start date' })
  if (Number(campaign.daily_budget) > 0 && Number(campaign.daily_budget) < 20)
    issues.push({ status: STATUS.warn, msg: `Budget of $${campaign.daily_budget}/day may limit reach significantly` })
  if (issues.length === 0)
    issues.push({ status: STATUS.ok, msg: 'All required fields present and valid' })
  return issues
}

async function aiValidate(campaigns, apiKey) {
  const campaignData = campaigns.map(c => ({
    name: c.campaign_name,
    account: c.account_name,
    tactic: c.tactic,
    adType: c.ad_type,
    budget: c.daily_budget,
    landing: c.landing_page,
    keywords: c.keywords,
    geo: c.geo_targets,
    ages: c.age_ranges,
    gender: c.gender,
    start: c.start_date,
    end: c.end_date,
  }))
  const prompt = `You are a Google Ads expert. Review these campaign configurations and return JSON only.
For each campaign return: { campaign_name, issues: [{ status: "ok"|"warn"|"err", msg: string }] }
Focus on: missing fields, low budgets, keyword gaps, geo strategy, date ranges, tactic-specific requirements.
Campaigns: ${JSON.stringify(campaignData)}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.content[0].text
  const json = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || text)
  return json
}

const statusIcon = { ok: <CheckCircle size={16} className="text-green-600" />, warn: <AlertTriangle size={16} className="text-yellow-500" />, err: <XCircle size={16} className="text-red-500" /> }
const statusBg = { ok: 'bg-green-50 border-green-200', warn: 'bg-yellow-50 border-yellow-200', err: 'bg-red-50 border-red-200' }
const statusText = { ok: 'text-green-800', warn: 'text-yellow-800', err: 'text-red-800' }

export default function Stage3Validate({ campaigns, onBack, onNext }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('claude_api_key') || '')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useAI, setUseAI] = useState(false)

  async function runValidation() {
    setError('')
    setLoading(true)
    if (apiKey) localStorage.setItem('claude_api_key', apiKey)

    try {
      let validated
      if (useAI && apiKey) {
        const aiResults = await aiValidate(campaigns, apiKey)
        validated = campaigns.map(c => {
          const aiRow = aiResults.find(r => r.campaign_name === c.campaign_name) || {}
          const local = localValidate(c).filter(i => i.status !== STATUS.ok)
          const ai = (aiRow.issues || []).filter(i => i.status !== STATUS.ok)
          const combined = [...local, ...ai]
          return { campaign: c, issues: combined.length ? combined : [{ status: STATUS.ok, msg: 'All checks passed' }] }
        })
      } else {
        validated = campaigns.map(c => ({ campaign: c, issues: localValidate(c) }))
      }
      setResults(validated)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const worstStatus = (issues) => issues.some(i => i.status === 'err') ? 'err' : issues.some(i => i.status === 'warn') ? 'warn' : 'ok'

  return (
    <div className="space-y-5">
      <div className="p-4 border border-gray-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Validation Mode</h3>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input type="checkbox" checked={useAI} onChange={e => setUseAI(e.target.checked)} className="accent-blue-600" />
            Use Claude AI (enhanced)
          </label>
        </div>
        {useAI && (
          <div className="flex items-center gap-2">
            <Key size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="password"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Claude API key (sk-ant-...)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
          </div>
        )}
        <button
          onClick={runValidation}
          disabled={loading || (useAI && !apiKey)}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader size={16} className="animate-spin" /> Validating...</> : `Run ${useAI ? 'AI' : 'Local'} Validation`}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <XCircle size={16} className="mt-0.5" />
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-3">
          {results.map(({ campaign, issues }, i) => {
            const ws = worstStatus(issues)
            return (
              <div key={i} className={`border rounded-xl overflow-hidden ${statusBg[ws]}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  {statusIcon[ws]}
                  <div className="flex-1">
                    <p className={`font-semibold ${statusText[ws]}`}>{campaign.campaign_name}</p>
                    <p className={`text-xs ${statusText[ws]} opacity-70`}>{campaign.account_name} · {campaign.tactic}</p>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full
                    ${ws === 'ok' ? 'bg-green-200 text-green-800' : ws === 'warn' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                    {ws === 'ok' ? 'OK' : ws === 'warn' ? 'Warning' : 'Error'}
                  </span>
                </div>
                <ul className="px-4 pb-3 space-y-1.5">
                  {issues.map((issue, j) => (
                    <li key={j} className={`flex items-start gap-2 text-sm ${statusText[issue.status]}`}>
                      {statusIcon[issue.status]}
                      <span>{issue.msg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          <div className="flex gap-3 pt-2">
            <button onClick={onBack} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">← Back</button>
            <button
              onClick={() => onNext(campaigns, results)}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Continue to Preview & Launch →
            </button>
          </div>
        </div>
      )}

      {!results && (
        <div className="flex gap-3 pt-2">
          <button onClick={onBack} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">← Back</button>
        </div>
      )}
    </div>
  )
}
