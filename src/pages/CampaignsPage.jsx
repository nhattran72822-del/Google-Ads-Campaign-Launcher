import TagInput from '../components/TagInput'
import CheckGroup from '../components/CheckGroup'

const TACTICS = ['Search','Display','Performance Max','Video','Shopping','App']
const BID = ['Target CPA','Target ROAS','Maximize Conversions','Maximize Clicks','Manual CPC']
const AGES = ['18-24','25-34','35-44','45-54','55-64','65+']
const GENDERS = ['All','Male','Female']
const GEOS = ['United States','Canada','United Kingdom','Australia','Germany','France','Japan','Brazil']

export default function CampaignsPage({ campaign, onChange, onRemove, toast }) {
  if (!campaign) return <div style={{ padding:20, color:'var(--color-text-secondary)' }}>No campaign selected.</div>

  function set(field, val) { onChange({ ...campaign, [field]: val }) }

  function save() {
    toast('Campaign saved: ' + campaign.name, 'ok')
  }

  return (
    <>
      <div className="card">
        <div className="card-hd">Campaign basics</div>
        <div className="grid2">
          <div className="fg">
            <label>Account name</label>
            <input value={campaign.account} onChange={e => set('account', e.target.value)} placeholder="Acme Corp" />
          </div>
          <div className="fg">
            <label>Campaign name</label>
            <input value={campaign.name} onChange={e => set('name', e.target.value)} placeholder="Brand Awareness Q3" />
          </div>
          <div className="fg full">
            <label>Landing page URL</label>
            <input value={campaign.landingPage} onChange={e => set('landingPage', e.target.value)} placeholder="https://…" />
          </div>
          <div className="fg">
            <label>Daily budget ($)</label>
            <input type="number" value={campaign.budget} min="1" onChange={e => set('budget', e.target.value)} />
          </div>
          <div className="fg">
            <label>Bid strategy</label>
            <select value={campaign.bidStrategy} onChange={e => set('bidStrategy', e.target.value)}>
              {BID.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Start date</label>
            <input type="text" value={campaign.start} onChange={e => set('start', e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <div className="fg">
            <label>End date</label>
            <input type="text" value={campaign.end} onChange={e => set('end', e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">Tactic &amp; ad type <span className="badge b-amber">Ad settings</span></div>
        <div className="grid2">
          <div className="fg">
            <label>Tactic</label>
            <select value={campaign.tactic} onChange={e => set('tactic', e.target.value)}>
              {TACTICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Ad type</label>
            <input value={campaign.adType} onChange={e => set('adType', e.target.value)} />
          </div>
          <div className="fg full">
            <label>Keywords</label>
            <TagInput tags={campaign.keywords} onChange={v => set('keywords', v)} placeholder="Type keyword + Enter…" />
          </div>
          <div className="fg full">
            <label>Notes</label>
            <textarea value={campaign.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">Demographics <span className="badge b-blue">Audience</span></div>
        <div className="fg" style={{ marginBottom:10 }}>
          <label>Age ranges</label>
          <CheckGroup options={AGES} selected={campaign.ages} onChange={v => set('ages', v)} />
        </div>
        <div className="fg">
          <label>Gender targeting</label>
          <CheckGroup options={GENDERS} selected={campaign.genders} onChange={v => set('genders', v)} />
        </div>
      </div>

      <div className="card">
        <div className="card-hd">Geographic targeting <span className="badge b-green">Geo</span></div>
        <div className="fg" style={{ marginBottom:10 }}>
          <label>Target locations</label>
          <TagInput tags={campaign.geos} onChange={v => set('geos', v)} placeholder="Type location + Enter…" />
        </div>
        <CheckGroup options={GEOS} selected={campaign.geos} onChange={v => set('geos', v)} />
      </div>

      <div style={{ display:'flex', gap:7, marginTop:4 }}>
        <button className="btn prim" onClick={save}>Save campaign</button>
        <button className="btn danger" onClick={onRemove}>Remove</button>
      </div>
    </>
  )
}
