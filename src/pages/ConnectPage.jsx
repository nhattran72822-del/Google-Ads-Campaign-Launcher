function ConnCheck({ label, ok }) {
  return (
    <div className="conn-check">
      <div className="conn-dot" style={{ background: ok ? '#EAF3DE' : '#F1EFE8', color: ok ? '#3B6D11' : '#888780' }}>
        {ok ? '✓' : '○'}
      </div>
      <span style={{ color: ok ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{label}</span>
    </div>
  )
}

export default function ConnectPage({ creds, setCreds, connected, account, accessToken, logs, onConnect, onClear, onNext }) {
  function set(field, val) { setCreds(prev => ({ ...prev, [field]: val })) }

  return (
    <>
      <div className="card">
        <div className="card-hd">API credentials <span className="badge b-blue">Google Cloud Console</span></div>
        <div className="grid2">
          <div className="fg">
            <label>Client ID</label>
            <input type="password" value={creds.clientId} onChange={e => set('clientId', e.target.value)} placeholder="123…apps.googleusercontent.com" />
          </div>
          <div className="fg">
            <label>Client Secret</label>
            <input type="password" value={creds.clientSecret} onChange={e => set('clientSecret', e.target.value)} placeholder="GOCSPX-…" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">Google Ads credentials <span className="badge b-amber">API Center</span></div>
        <div className="grid2">
          <div className="fg">
            <label>Developer Token</label>
            <input type="password" value={creds.developerToken} onChange={e => set('developerToken', e.target.value)} placeholder="AbCdEf-…" />
            <div className="hint">ads.google.com/aw/apicenter</div>
          </div>
          <div className="fg">
            <label>Refresh Token</label>
            <input type="password" value={creds.refreshToken} onChange={e => set('refreshToken', e.target.value)} placeholder="1//0g…" />
            <div className="hint">From OAuth consent flow</div>
          </div>
          <div className="fg">
            <label>Manager Account ID (MCC)</label>
            <input type="text" value={creds.loginCustomerId} onChange={e => set('loginCustomerId', e.target.value)} placeholder="123-456-7890" />
          </div>
          <div className="fg">
            <label>API Version</label>
            <select value={creds.version} onChange={e => set('version', e.target.value)}>
              <option value="v22">v22 — latest (Oct 2025)</option>
              <option value="v21">v21</option>
              <option value="v20">v20</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">
          Connection status
          <span className={`badge ${connected ? 'b-green' : 'b-gray'}`}>{connected ? 'Connected' : 'Not connected'}</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <ConnCheck label="Client ID" ok={!!creds.clientId} />
          <ConnCheck label="Client Secret" ok={!!creds.clientSecret} />
          <ConnCheck label="Developer Token" ok={!!creds.developerToken} />
          <ConnCheck label="Refresh Token" ok={!!creds.refreshToken} />
          <ConnCheck label="Access token" ok={!!accessToken} />
          <ConnCheck label="Account selected" ok={!!account} />
        </div>
        <div style={{ display:'flex', gap: 7 }}>
          <button className="btn prim" onClick={() => onConnect()}>Connect to Google Ads API</button>
          <button className="btn" onClick={onClear}>Clear</button>
        </div>
        {logs.length > 0 && (
          <>
            <div className="divider" />
            <div className="log-box">
              {logs.slice(0, 10).map((l, i) => (
                <div key={i} className={l.t === 'ok' ? 'log-ok' : l.t === 'err' ? 'log-err' : 'log-info'}>{l.msg}</div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-hd">
          Accessible accounts
          <span className="badge b-blue">{connected ? '1 account' : '—'}</span>
        </div>
        {connected ? (
          <>
            <div className="api-row" style={{ borderColor:'#C0DD97', background:'#EAF3DE18' }}>
              <div className="api-icon" style={{ background:'#EAF3DE' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3B6D11" strokeWidth="1.4">
                  <rect x="1" y="2" width="12" height="10" rx="1.5"/><line x1="4" y1="7" x2="10" y2="7"/>
                </svg>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:500 }}>Manager Account</div>
                <div style={{ fontSize:10, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)' }}>customers/{account}</div>
              </div>
              <span className="badge b-green">Selected</span>
            </div>
            <div style={{ marginTop:10 }}>
              <button className="btn prim sm" onClick={onNext}>Configure campaigns →</button>
            </div>
          </>
        ) : (
          <div style={{ fontSize:12, color:'var(--color-text-tertiary)', padding:'8px 0' }}>
            Connect above to list accessible accounts.
          </div>
        )}
      </div>
    </>
  )
}
