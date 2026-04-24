import { buildPayload, syntaxHL } from '../App'

export default function LaunchPage({ campaigns, active, setActive, account, onLaunchOne, onLaunchAll, toast }) {
  const totalBudget = campaigns.reduce((s, c) => s + Number(c.budget), 0)
  const launchedCount = campaigns.filter(c => c.launched).length
  const validatedCount = campaigns.filter(c => c.validated === true).length
  const c = campaigns[active]
  if (!c) return null

  const payload = buildPayload(c, account)
  const jsonStr = syntaxHL(JSON.stringify(payload, null, 2))

  function copy() {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    toast('Payload copied to clipboard', 'ok')
  }

  function downloadAll() {
    const all = campaigns.map(camp => buildPayload(camp, account))
    const blob = new Blob([JSON.stringify(all, null, 2)], { type:'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'google-ads-campaigns-v22.json'; a.click()
    URL.revokeObjectURL(url)
    toast('Downloaded ' + campaigns.length + ' campaign payloads', 'ok')
  }

  return (
    <>
      <div className="stat-row">
        <div className="stat"><div className="stat-lbl">Total campaigns</div><div className="stat-val">{campaigns.length}</div></div>
        <div className="stat"><div className="stat-lbl">Daily budget</div><div className="stat-val">${totalBudget}</div></div>
        <div className="stat"><div className="stat-lbl">Validated</div><div className="stat-val">{validatedCount}/{campaigns.length}</div></div>
        <div className="stat"><div className="stat-lbl">Launched</div><div className="stat-val">{launchedCount}/{campaigns.length}</div></div>
      </div>

      <div className="card">
        <div className="card-hd">Campaign summary <span className="badge b-blue">{campaigns.length} total</span></div>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width:'28%' }}>Campaign</th>
                <th style={{ width:'18%' }}>Account</th>
                <th style={{ width:'14%' }}>Tactic</th>
                <th style={{ width:'12%' }}>Budget</th>
                <th style={{ width:'14%' }}>Bid strategy</th>
                <th style={{ width:'14%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp, i) => {
                const st = camp.launched ? 'launched' : camp.validated === false ? 'error' : camp.validated ? 'live' : 'pending'
                const lbl = camp.launched ? 'launched' : camp.validated === false ? 'error' : camp.validated ? 'validated' : 'draft'
                return (
                  <tr key={camp.id} className={i === active ? 'sel' : ''} onClick={() => setActive(i)}>
                    <td style={{ fontWeight:500 }}>{camp.name}</td>
                    <td>{camp.account}</td>
                    <td>{camp.tactic}</td>
                    <td>${camp.budget}/day</td>
                    <td>{camp.bidStrategy}</td>
                    <td><span className={`pill-status ps-${st}`}>{lbl}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">
          Google Ads API payload — {c.name}
          <span className="badge b-blue">v22 · REST</span>
          {c.launched && <span className="badge b-green">Launched</span>}
        </div>
        <div className="json-box" dangerouslySetInnerHTML={{ __html: jsonStr }} />
        <div style={{ display:'flex', gap:7, marginTop:10 }}>
          <button className="btn sm" onClick={copy}>Copy JSON</button>
          <button className="btn sm" onClick={downloadAll}>Download all ({campaigns.length})</button>
          <button className="btn grn sm" onClick={() => onLaunchOne(active)}>Launch this ↗</button>
          <button className="btn prim sm" onClick={onLaunchAll}>Launch all ↗</button>
        </div>
      </div>
    </>
  )
}
