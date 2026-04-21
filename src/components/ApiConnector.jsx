import { useState } from 'react'
import { Key, RefreshCw, Users, Play, CheckCircle, XCircle, Loader, Copy, ExternalLink } from 'lucide-react'

const TABS = [
  { id: 'credentials', label: 'Credentials', icon: Key },
  { id: 'token', label: 'Token Exchange', icon: RefreshCw },
  { id: 'accounts', label: 'Accounts', icon: Users },
  { id: 'test', label: 'Test & Launch', icon: Play },
]

const OAUTH_SCOPES = 'https://www.googleapis.com/auth/adwords'
const TOKEN_URL = 'https://www.googleapis.com/oauth2/v3/token'
const ADS_API_BASE = 'https://googleads.googleapis.com/v22'

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function StatusBadge({ ok, label }) {
  return ok
    ? <span className="flex items-center gap-1 text-green-700 text-xs font-semibold"><CheckCircle size={13} />{label}</span>
    : <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircle size={13} />{label}</span>
}

export default function ApiConnector() {
  const [tab, setTab] = useState('credentials')

  // Credentials
  const [clientId, setClientId] = useState(localStorage.getItem('gads_client_id') || '')
  const [clientSecret, setClientSecret] = useState(localStorage.getItem('gads_client_secret') || '')
  const [devToken, setDevToken] = useState(localStorage.getItem('gads_dev_token') || '')
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('gads_refresh_token') || '')
  const [credsSaved, setCredsSaved] = useState(false)

  // Token
  const [accessToken, setAccessToken] = useState('')
  const [tokenExpiry, setTokenExpiry] = useState(null)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [tokenError, setTokenError] = useState('')

  // Accounts
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [accountsError, setAccountsError] = useState('')

  // Test
  const [testResult, setTestResult] = useState(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState('')

  const hasCreds = clientId && clientSecret && devToken && refreshToken

  function saveCreds() {
    localStorage.setItem('gads_client_id', clientId)
    localStorage.setItem('gads_client_secret', clientSecret)
    localStorage.setItem('gads_dev_token', devToken)
    localStorage.setItem('gads_refresh_token', refreshToken)
    setCredsSaved(true)
    setTimeout(() => setCredsSaved(false), 2000)
  }

  function buildConsentUrl() {
    return `https://accounts.google.com/o/oauth2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=${encodeURIComponent(OAUTH_SCOPES)}&access_type=offline&prompt=consent`
  }

  async function exchangeToken() {
    setTokenLoading(true)
    setTokenError('')
    try {
      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error_description || data.error)
      setAccessToken(data.access_token)
      setTokenExpiry(new Date(Date.now() + data.expires_in * 1000))
    } catch (e) {
      setTokenError(e.message)
    } finally {
      setTokenLoading(false)
    }
  }

  async function loadAccounts() {
    setAccountsLoading(true)
    setAccountsError('')
    try {
      const res = await fetch(`${ADS_API_BASE}/customers:listAccessibleCustomers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': devToken,
        },
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      setAccounts(data.resourceNames || [])
    } catch (e) {
      setAccountsError(e.message)
    } finally {
      setAccountsLoading(false)
    }
  }

  async function runTest() {
    setTestLoading(true)
    setTestError('')
    setTestResult(null)
    const customerId = selectedAccount.replace('customers/', '')
    try {
      const res = await fetch(`${ADS_API_BASE}/customers/${customerId}/googleAds:search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': devToken,
          'Content-Type': 'application/json',
          'login-customer-id': customerId,
        },
        body: JSON.stringify({ query: 'SELECT campaign.id, campaign.name, campaign.status FROM campaign LIMIT 5' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      setTestResult(data)
    } catch (e) {
      setTestError(e.message)
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="space-y-0">
      <div className="flex border-b border-gray-200">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="pt-5 space-y-5">
        {tab === 'credentials' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Credentials are stored in your browser's localStorage only — never sent to any third party.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Client ID" hint="Google Cloud Console → APIs & Services → Credentials">
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={clientId} onChange={e => setClientId(e.target.value)} placeholder="xxx.apps.googleusercontent.com" />
              </Field>
              <Field label="Client Secret" hint="Same OAuth 2.0 app as above">
                <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder="GOCSPX-..." />
              </Field>
              <Field label="Developer Token" hint="ads.google.com/aw/apicenter">
                <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={devToken} onChange={e => setDevToken(e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxx" />
              </Field>
              <Field label="Refresh Token" hint="Use OAuth Playground or generate below">
                <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={refreshToken} onChange={e => setRefreshToken(e.target.value)} placeholder="1//xxxxxxxxxxxxxxxx" />
              </Field>
            </div>

            {clientId && (
              <details className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-blue-600">Generate OAuth consent URL</summary>
                <div className="mt-3 space-y-2">
                  <p className="text-gray-600 text-xs">1. Open the URL below, authorize access, copy the code, then exchange it for a refresh token.</p>
                  <div className="flex items-center gap-2">
                    <input readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs font-mono bg-white"
                      value={buildConsentUrl()} />
                    <a href={buildConsentUrl()} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                      <ExternalLink size={11} /> Open
                    </a>
                  </div>
                </div>
              </details>
            )}

            <button onClick={saveCreds} disabled={!hasCreds}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              {credsSaved ? <><CheckCircle size={16} /> Saved!</> : 'Save Credentials'}
            </button>
          </div>
        )}

        {tab === 'token' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatusBadge ok={!!clientId} label="Client ID" />
              <StatusBadge ok={!!clientSecret} label="Client Secret" />
              <StatusBadge ok={!!devToken} label="Dev Token" />
              <StatusBadge ok={!!refreshToken} label="Refresh Token" />
            </div>
            <p className="text-sm text-gray-600">Exchanges your refresh token for a short-lived access token via <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{TOKEN_URL}</code></p>
            <button onClick={exchangeToken} disabled={!hasCreds || tokenLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              {tokenLoading ? <><Loader size={16} className="animate-spin" /> Exchanging...</> : 'Exchange Token'}
            </button>
            {tokenError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2"><XCircle size={15} className="mt-0.5" />{tokenError}</div>}
            {accessToken && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-800 flex items-center gap-1"><CheckCircle size={14} /> Access Token</span>
                    <button onClick={() => navigator.clipboard.writeText(accessToken)} className="text-xs text-green-700 flex items-center gap-1 hover:underline"><Copy size={11} /> Copy</button>
                  </div>
                  <p className="font-mono text-xs text-green-700 break-all">{accessToken.slice(0, 60)}...</p>
                  {tokenExpiry && <p className="text-xs text-green-600">Expires: {tokenExpiry.toLocaleTimeString()}</p>}
                </div>
                <button onClick={() => { setAccessToken(''); setTokenExpiry(null) }}
                  className="text-sm text-red-500 hover:underline">Revoke token</button>
              </div>
            )}
          </div>
        )}

        {tab === 'accounts' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Lists all accounts accessible via <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">customers:listAccessibleCustomers</code></p>
            <button onClick={loadAccounts} disabled={!accessToken || accountsLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              {accountsLoading ? <><Loader size={16} className="animate-spin" /> Loading...</> : 'Load Accessible Accounts'}
            </button>
            {!accessToken && <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">Exchange a token first on the Token Exchange tab.</p>}
            {accountsError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{accountsError}</div>}
            {accounts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{accounts.length} account{accounts.length !== 1 ? 's' : ''} found</p>
                <div className="space-y-1.5">
                  {accounts.map(a => (
                    <label key={a} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                      ${selectedAccount === a ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="account" value={a} checked={selectedAccount === a}
                        onChange={() => setSelectedAccount(a)} className="accent-blue-600" />
                      <span className="font-mono text-sm text-gray-700">{a}</span>
                      {selectedAccount === a && <span className="ml-auto text-xs text-blue-600 font-semibold">Active</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'test' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatusBadge ok={!!accessToken} label="Access Token" />
              <StatusBadge ok={!!selectedAccount} label="Account Selected" />
            </div>
            <p className="text-sm text-gray-600">Runs a live GAQL query to verify end-to-end connectivity:</p>
            <pre className="bg-gray-900 text-green-300 text-xs p-3 rounded-lg font-mono">
              SELECT campaign.id, campaign.name, campaign.status{'\n'}FROM campaign LIMIT 5
            </pre>
            <button onClick={runTest} disabled={!accessToken || !selectedAccount || testLoading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              {testLoading ? <><Loader size={16} className="animate-spin" /> Running...</> : <><Play size={15} /> Run Connection Test</>}
            </button>
            {(!accessToken || !selectedAccount) && (
              <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                {!accessToken ? 'Exchange a token first.' : 'Select an account on the Accounts tab.'}
              </p>
            )}
            {testError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2"><XCircle size={15} className="mt-0.5" />{testError}</div>}
            {testResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm"><CheckCircle size={16} /> Connection successful!</div>
                <pre className="bg-gray-900 text-green-300 text-xs p-3 rounded-lg overflow-x-auto max-h-60 font-mono">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
