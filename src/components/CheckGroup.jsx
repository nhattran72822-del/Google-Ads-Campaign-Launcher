export default function CheckGroup({ options, selected = [], onChange }) {
  function toggle(v) {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v])
  }
  return (
    <div className="chk-group">
      {options.map(o => (
        <div key={o} className={`chk-item ${selected.includes(o) ? 'on' : ''}`} onClick={() => toggle(o)}>
          {o}
        </div>
      ))}
    </div>
  )
}
