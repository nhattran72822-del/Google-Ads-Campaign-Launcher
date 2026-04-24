export default function Sidebar({ page, setPage, connected, account, campaigns, active, setActive }) {
  function pillStatus(c) {
    if (c.launched) return 'launched'
    if (c.validated === false) return 'error'
    if (c.validated === true) return 'live'
    return 'pending'
  }
  function pillLabel(c) {
    if (c.launched) return 'live'
    if (c.validated === false) return 'error'
    if (c.validated === true) return 'ok'
    return 'draft'
  }

  return (
    <div className="sidebar">
      <div className="sdb-brand">
        <div className="logo">Ads Launch</div>
        <div className="name">Campaign Hub</div>
      </div>

      <div className="sdb-conn">
        <div className={`cdot ${connected ? '' : 'warn'}`} />
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
          {connected ? `Connected · ${account || 'account'}` : 'API not connected'}
        </span>
      </div>

      <div className="sdb-section">Workflow</div>

      <NavItem id="connect" current={page} onClick={() => setPage('connect')}>
        <svg className="nav-ic" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="7" cy="7" r="5.5"/><circle cx="7" cy="7" r="2"/>
          <line x1="7" y1="1.5" x2="7" y2="4.5"/>
        </svg>
        API connect
      </NavItem>

      <NavItem id="campaigns" current={page} onClick={() => setPage('campaigns')}>
        <svg className="nav-ic" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="1.5" y="2" width="11" height="10" rx="1.5"/>
          <line x1="4" y1="7" x2="10" y2="7"/><line x1="4" y1="5" x2="10" y2="5"/><line x1="4" y1="9" x2="7" y2="9"/>
        </svg>
        Campaigns
      </NavItem>

      <NavItem id="validate" current={page} onClick={() => setPage('validate')}>
        <svg className="nav-ic" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M11.5 3.5L5.5 10 2.5 7"/><circle cx="7" cy="7" r="5.5"/>
        </svg>
        AI validate
      </NavItem>

      <NavItem id="launch" current={page} onClick={() => setPage('launch')}>
        <svg className="nav-ic" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M7 1.5C9.5 1.5 12 4 12 7c0 1-.3 2-.8 2.8M4.5 3A5.5 5.5 0 002 7"/>
          <circle cx="7" cy="7" r="2"/><line x1="7" y1="9" x2="7" y2="12.5"/>
        </svg>
        Launch
      </NavItem>

      <div className="sdb-section">Campaigns</div>

      <div className="sdb-camps">
        {campaigns.map((c, i) => (
          <div
            key={c.id}
            className={`camp-pill ${i === active ? 'on' : ''}`}
            onClick={() => { setActive(i); if (page !== 'connect') {} }}
          >
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:110 }}>{c.name}</span>
            <span className={`pill-status ps-${pillStatus(c)}`}>{pillLabel(c)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NavItem({ id, current, onClick, children }) {
  return (
    <div className={`nav ${current === id ? 'on' : ''}`} onClick={onClick}>
      {children}
    </div>
  )
}
