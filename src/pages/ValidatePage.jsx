function ValResult({ issues }) {
  if (!issues || issues.length === 0)
    return <span style={{ fontSize:12, color:'var(--color-text-tertiary)' }}>Click "Run AI validation" to check.</span>
  return issues.map((v, i) => (
    <div key={i} className="val-result-item">
      <div className="val-dot" style={{ background: v.t === 'ok' ? '#639922' : v.t === 'warn' ? '#EF9F27' : '#E24B4A' }} />
      <div><strong>{v.field}:</strong> {v.msg}</div>
    </div>
  ))
}

export default function ValidatePage({ campaigns }) {
  return (
    <>
      <div style={{ marginBottom:12, fontSize:12, color:'var(--color-text-secondary)' }}>
        {campaigns.length} campaigns ready for AI validation. Click "Run AI validation" to check each one.
      </div>
      {campaigns.map((c, i) => (
        <div key={c.id} className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'var(--color-background-secondary)', borderBottom:'0.5px solid var(--color-border-tertiary)' }}>
            <div>
              <div style={{ fontWeight:500, fontSize:13 }}>{c.name}</div>
              <div style={{ fontSize:11, color:'var(--color-text-secondary)' }}>{c.account} · {c.tactic} · ${c.budget}/day</div>
            </div>
            <span className={`badge ${c.validated === true ? 'b-green' : c.validated === false ? 'b-red' : 'b-gray'}`}>
              {c.validated === true ? 'Validated' : c.validated === false ? 'Issues found' : 'Not validated'}
            </span>
          </div>
          <div style={{ padding:'10px 14px' }}>
            {c.validated !== null
              ? <ValResult issues={c.valIssues} />
              : <span style={{ fontSize:12, color:'var(--color-text-tertiary)' }}>Click "Run AI validation" to check.</span>
            }
          </div>
        </div>
      ))}
    </>
  )
}
