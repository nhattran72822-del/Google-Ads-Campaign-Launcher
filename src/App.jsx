import { useState, useCallback } from 'react'
import './index.css'
import Sidebar from './components/Sidebar'
import ConnectPage from './pages/ConnectPage'
import CampaignsPage from './pages/CampaignsPage'
import ValidatePage from './pages/ValidatePage'
import LaunchPage from './pages/LaunchPage'

const INITIAL_CAMPAIGNS = [
  { id:1, name:'Brand Awareness Q3', account:'Acme Corp', tactic:'Search', adType:'Responsive Search Ad', budget:150, bidStrategy:'Target CPA', geos:['United States','Canada'], ages:['25-34','35-44'], genders:['All'], keywords:['running shoes','athletic shoes','best running shoes'], landingPage:'https://acme.com/summer', start:'2025-08-01', end:'2025-09-30', notes:'Focus on upper funnel', validated:null, valIssues:[], launched:false },
  { id:2, name:'Retargeting — Cart Abandon', account:'Acme Corp', tactic:'Display', adType:'Responsive Display Ad', budget:75, bidStrategy:'Maximize Conversions', geos:['California','New York','Texas'], ages:['18-24','25-34'], genders:['Female'], keywords:['retargeting','cart abandonment'], landingPage:'https://acme.com/cart', start:'2025-08-01', end:'2025-08-31', notes:'High intent audience', validated:null, valIssues:[], launched:false },
  { id:3, name:'Product Launch PMax', account:'TechStart Inc', tactic:'Performance Max', adType:'Auto', budget:500, bidStrategy:'Target ROAS', geos:['United Kingdom','Australia','Canada'], ages:['25-34','35-44','45-54'], genders:['All'], keywords:['SaaS tool','project management','team collaboration'], landingPage:'https://techstart.io/launch', start:'2025-09-01', end:'2025-11-30', notes:'New product — test all placements', validated:null, valIssues:[], launched:false }
]

const PAGE_META = {
  connect:   { title: 'API Connection',        sub: 'Step 1 of 4 — Connect to Google Ads API v22' },
  campaigns: { title: 'Configure Campaigns',   sub: 'Step 2 of 4 — Review and edit each campaign' },
  validate:  { title: 'AI Validate',           sub: 'Step 3 of 4 — AI validation of all campaigns' },
  launch:    { title: 'Preview & Launch',       sub: 'Step 4 of 4 — Preview API payload and go live' },
}

let toastId = 0
export function useToast() {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((msg, type = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])
  return { toasts, toast }
}

export default function App() {
  const [page, setPage] = useState('connect')
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [creds, setCreds] = useState({ clientId:'', clientSecret:'', developerToken:'', refreshToken:'', loginCustomerId:'', version:'v22' })
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS)
  const [active, setActive] = useState(0)
  const [logs, setLogs] = useState([])
  const { toasts, toast } = useToast()

  function addLog(msg, type = 'info') {
    setLogs(prev => [{ msg, t: type, ts: Date.now() }, ...prev].slice(0, 20))
  }

  async function mockConnect(newCreds) {
    const c = newCreds || creds
    toast('Connecting to Google Ads API…', 'info')
    addLog('POST https://oauth2.googleapis.com/token', 'info')
    await delay(900)
    setAccessToken('ya29.mock_' + Math.random().toString(36).slice(2, 10))
    addLog('Access token obtained. Expires in 60 min', 'ok')
    await delay(500)
    addLog('GET /v22/customers:listAccessibleCustomers → 200', 'ok')
    const acc = c.loginCustomerId ? c.loginCustomerId.replace(/-/g,'') : '9876543210'
    setAccount(acc)
    setConnected(true)
    addLog('Account selected: customers/' + acc, 'ok')
    toast('Connected! Account loaded.', 'ok')
  }

  function clearCreds() {
    setCreds({ clientId:'', clientSecret:'', developerToken:'', refreshToken:'', loginCustomerId:'', version:'v22' })
    setAccessToken(null)
    setConnected(false)
    setAccount(null)
    setLogs([])
  }

  function loadSample() {
    const sample = { clientId:'123456789-abc.apps.googleusercontent.com', clientSecret:'GOCSPX-sample', developerToken:'AbCdEfGhIj-sample', refreshToken:'1//0gSampleRefreshToken', loginCustomerId:'987-654-3210', version:'v22' }
    setCreds(sample)
    toast('Sample credentials loaded', 'info')
  }

  function updateCampaign(idx, updated) {
    setCampaigns(prev => prev.map((c, i) => i === idx ? updated : c))
  }

  function addCampaign() {
    const newC = { id: Date.now(), name:'New Campaign', account:'', tactic:'Search', adType:'Responsive Search Ad', budget:50, bidStrategy:'Maximize Conversions', geos:['United States'], ages:['25-34'], genders:['All'], keywords:[], landingPage:'', start:'', end:'', notes:'', validated:null, valIssues:[], launched:false }
    setCampaigns(prev => [...prev, newC])
    setActive(campaigns.length)
  }

  function removeCampaign(idx) {
    setCampaigns(prev => prev.filter((_, i) => i !== idx))
    setActive(prev => Math.max(0, prev >= idx ? prev - 1 : prev))
  }

  async function runAllValidation() {
    for (let i = 0; i < campaigns.length; i++) {
      await delay(700 + Math.random() * 400)
      const c = campaigns[i]
      const issues = []
      if (!c.landingPage) issues.push({ t:'err', field:'Landing page', msg:'Missing — required for all campaigns' })
      else issues.push({ t:'ok', field:'Landing page', msg:'Valid URL provided' })
      if (c.budget < 10) issues.push({ t:'err', field:'Budget', msg:'Below $10/day minimum — increase to at least $10' })
      else issues.push({ t:'ok', field:'Budget', msg:`$${c.budget}/day — within recommended range` })
      if (c.tactic === 'Search' && c.keywords.length === 0) issues.push({ t:'err', field:'Keywords', msg:'No keywords for Search campaign' })
      else if (c.keywords.length > 0) issues.push({ t:'ok', field:'Keywords', msg:`${c.keywords.length} keyword(s) configured` })
      if (!c.geos.length) issues.push({ t:'warn', field:'Geo targeting', msg:'No locations set — campaign will run globally' })
      else issues.push({ t:'ok', field:'Geo targeting', msg: c.geos.join(', ') })
      if (!c.start) issues.push({ t:'warn', field:'Start date', msg:'No start date — campaign will start immediately' })
      else issues.push({ t:'ok', field:'Start date', msg: c.start })
      const passed = !issues.some(v => v.t === 'err')
      setCampaigns(prev => prev.map((camp, idx) => idx === i ? { ...camp, validated: passed, valIssues: issues } : camp))
    }
    toast('Validation complete for all campaigns', 'ok')
  }

  function launchOne(idx) {
    if (!connected) { toast('Connect to Google Ads API first', 'err'); return }
    setCampaigns(prev => prev.map((c, i) => i === idx ? { ...c, launched: true } : c))
    toast(`Campaign "${campaigns[idx].name}" queued for launch via API v22 ↗`, 'ok')
  }

  function launchAll() {
    if (!connected) { toast('Connect to Google Ads API first', 'err'); return }
    setCampaigns(prev => prev.map(c => ({ ...c, launched: true })))
    toast(`All ${campaigns.length} campaigns queued for launch ↗`, 'ok')
  }

  const meta = PAGE_META[page] || {}
  const totalBudget = campaigns.reduce((s, c) => s + Number(c.budget), 0)
  const launchedCount = campaigns.filter(c => c.launched).length
  const validatedCount = campaigns.filter(c => c.validated === true).length

  function renderTopbarRight() {
    if (page === 'connect') return (
      <>
        <button className="btn sm" onClick={loadSample}>Load sample</button>
        <button className="btn prim sm" onClick={() => mockConnect()}>Connect →</button>
      </>
    )
    if (page === 'campaigns') return (
      <>
        <button className="btn sm" onClick={addCampaign}>+ Add</button>
        <button className="btn prim sm" onClick={() => setPage('validate')}>Validate all →</button>
      </>
    )
    if (page === 'validate') return (
      <button className="btn prim sm" onClick={runAllValidation}>Run AI validation ↗</button>
    )
    if (page === 'launch') return (
      <>
        <button className="btn sm" onClick={() => copyPayload(campaigns[active], account)}>Copy JSON</button>
        <button className="btn grn sm" onClick={launchAll}>Launch all ↗</button>
      </>
    )
  }

  function renderLaunchBar() {
    if (page === 'launch') return (
      <div className="launch-bar">
        <div className="launch-info">
          <span style={{fontWeight:500}}>{campaigns.length} campaigns</span>
          &nbsp;·&nbsp; ${totalBudget}/day total budget
          &nbsp;·&nbsp; {launchedCount}/{campaigns.length} launched
          &nbsp;·&nbsp; API v22 · {account || 'no account selected'}
        </div>
        <button className="btn prim sm" onClick={() => launchOne(active)}>Launch this campaign ↗</button>
      </div>
    )
    if (page === 'validate') return (
      <div className="launch-bar">
        <div className="launch-info">{validatedCount}/{campaigns.length} campaigns validated</div>
        <button className="btn prim sm" onClick={() => setPage('launch')}>Preview & launch →</button>
      </div>
    )
    return null
  }

  function renderTabs() {
    if (page !== 'campaigns' && page !== 'launch') return null
    return (
      <div className="tabs-bar">
        {campaigns.map((c, i) => (
          <div key={c.id} className={`tab ${i === active ? 'on' : ''}`} onClick={() => setActive(i)}>
            {c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="shell">
        <Sidebar
          page={page}
          setPage={setPage}
          connected={connected}
          account={account}
          campaigns={campaigns}
          active={active}
          setActive={setActive}
        />
        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <div>
                <div className="page-title">{meta.title}</div>
                <div className="breadcrumb">{meta.sub}</div>
              </div>
            </div>
            <div className="topbar-right">{renderTopbarRight()}</div>
          </div>
          {renderTabs()}
          <div className="content">
            {page === 'connect' && (
              <ConnectPage
                creds={creds} setCreds={setCreds}
                connected={connected} account={account}
                accessToken={accessToken} logs={logs}
                onConnect={mockConnect} onClear={clearCreds}
                onNext={() => setPage('campaigns')}
              />
            )}
            {page === 'campaigns' && (
              <CampaignsPage
                campaign={campaigns[active]}
                onChange={updated => updateCampaign(active, updated)}
                onRemove={() => removeCampaign(active)}
                toast={toast}
              />
            )}
            {page === 'validate' && (
              <ValidatePage campaigns={campaigns} />
            )}
            {page === 'launch' && (
              <LaunchPage
                campaigns={campaigns}
                active={active}
                setActive={setActive}
                account={account}
                onLaunchOne={launchOne}
                onLaunchAll={launchAll}
                toast={toast}
              />
            )}
          </div>
          {renderLaunchBar()}
        </div>
      </div>

      {toasts.map(t => (
        <div key={t.id} className={`notif ${t.type === 'ok' ? 'n-ok' : t.type === 'err' ? 'n-err' : 'n-info'}`}>
          {t.msg}
        </div>
      ))}
    </>
  )
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

export function copyPayload(campaign, account) {
  if (!campaign) return
  const payload = buildPayload(campaign, account)
  navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
}

export function buildPayload(c, account) {
  const channelMap = { Search:'SEARCH', Display:'DISPLAY', 'Performance Max':'PERFORMANCE_MAX', Video:'VIDEO', Shopping:'SHOPPING', App:'MULTI_CHANNEL' }
  return {
    resourceName: `customers/${account || '[ACCOUNT_ID]'}/campaigns/-1`,
    campaign: {
      name: c.name, status:'PAUSED',
      advertisingChannelType: channelMap[c.tactic] || 'SEARCH',
      campaignBudget: { amountMicros: Number(c.budget) * 1000000, deliveryMethod:'STANDARD' },
      biddingStrategy: { type: c.bidStrategy.toUpperCase().replace(/ /g,'_') },
      startDate: c.start || undefined, endDate: c.end || undefined,
    },
    adGroup: { name: c.name + ' — Ad Group 1', status:'ENABLED', keywords: c.keywords.map(k => ({ text:k, matchType:'BROAD' })) },
    geoTargets: c.geos.map(g => ({ locationName:g, reachCode:'LOCATION_OF_PRESENCE' })),
    demographics: { ageRanges: c.ages.map(a => 'AGE_RANGE_' + a.replace('-','_')), genders: c.genders.map(g => g.toUpperCase()) },
    ad: { type: c.adType.toUpperCase().replace(/ /g,'_'), finalUrls:[c.landingPage], headlines:['Headline 1','Headline 2','Headline 3'], descriptions:['Description 1','Description 2'] },
    metadata: { accountName:c.account, notes:c.notes, createdAt:new Date().toISOString(), apiVersion:'v22', workflowVersion:'2.0' }
  }
}

export function syntaxHL(json) {
  return json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, m => {
      if (/^"/.test(m)) return /:$/.test(m) ? `<span class="jk">${m}</span>` : `<span class="js">${m}</span>`
      if (/true|false/.test(m)) return `<span class="jb">${m}</span>`
      return `<span class="jn">${m}</span>`
    })
}
