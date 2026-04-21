import { useState } from 'react'
import { Copy, Download, CheckCircle, Rocket, ChevronDown, ChevronUp } from 'lucide-react'

function buildPayload(campaign) {
  const geoTargets = campaign.geo_targets ? campaign.geo_targets.split(';').filter(Boolean) : []
  const ageRanges = campaign.age_ranges ? campaign.age_ranges.split(';').filter(Boolean) : []
  const keywords = campaign.keywords ? campaign.keywords.split(';').filter(Boolean) : []

  return {
    metadata: {
      generated_at: new Date().toISOString(),
      tool_version: '1.0.0',
      google_ads_api_version: 'v22',
    },
    account: {
      customer_name: campaign.account_name,
    },
    campaign: {
      name: campaign.campaign_name,
      advertising_channel_type: tacticToChannel(campaign.tactic),
      status: 'PAUSED',
      start_date: campaign.start_date ? campaign.start_date.replace(/-/g, '') : '',
      end_date: campaign.end_date ? campaign.end_date.replace(/-/g, '') : '',
      campaign_budget: {
        amount_micros: Math.round(Number(campaign.daily_budget || 0) * 1_000_000),
        delivery_method: 'STANDARD',
      },
      bidding_strategy_type: campaign.tactic === 'Performance Max' ? 'MAXIMIZE_CONVERSIONS' : 'MAXIMIZE_CLICKS',
      network_settings: {
        target_google_search: ['Search', 'Performance Max'].includes(campaign.tactic),
        target_search_network: campaign.tactic === 'Search',
        target_content_network: ['Display', 'Performance Max', 'Discovery'].includes(campaign.tactic),
      },
    },
    ad_group: {
      name: `${campaign.campaign_name} - Ad Group 1`,
      type: tacticToAdGroupType(campaign.tactic),
      cpc_bid_micros: 1_000_000,
      ...(keywords.length > 0 && {
        keywords: keywords.map(kw => ({
          text: kw,
          match_type: 'BROAD',
        })),
      }),
    },
    ad: {
      type: campaign.ad_type || 'RESPONSIVE_SEARCH_AD',
      final_urls: [campaign.landing_page || ''],
      ...(campaign.tactic === 'Search' && {
        headlines: [
          { text: campaign.campaign_name.slice(0, 30), pinned_field: 'HEADLINE_1' },
          { text: 'Shop Now & Save', pinned_field: null },
          { text: 'Free Shipping Available', pinned_field: null },
        ],
        descriptions: [
          { text: 'Discover our exclusive offers. Shop today.' },
          { text: 'Quality products at unbeatable prices.' },
        ],
      }),
    },
    geo_targets: geoTargets.map(location => ({
      location_name: location,
      targeting_type: 'LOCATION_OF_PRESENCE_OR_INTEREST',
    })),
    demographics: {
      age_ranges: ageRanges.map(range => ({
        type: `AGE_RANGE_${range.replace('-', '_').replace('+', '_UP')}`,
        bid_modifier: 1.0,
      })),
      genders: campaign.gender === 'All' || !campaign.gender
        ? [{ type: 'MALE' }, { type: 'FEMALE' }, { type: 'UNDETERMINED' }]
        : [{ type: campaign.gender.toUpperCase() }],
    },
  }
}

function tacticToChannel(tactic) {
  const map = {
    Search: 'SEARCH',
    Display: 'DISPLAY',
    'Performance Max': 'PERFORMANCE_MAX',
    Video: 'VIDEO',
    Shopping: 'SHOPPING',
    Smart: 'SMART',
    Discovery: 'DISCOVERY',
  }
  return map[tactic] || 'SEARCH'
}

function tacticToAdGroupType(tactic) {
  const map = {
    Search: 'SEARCH_STANDARD',
    Display: 'DISPLAY_STANDARD',
    Video: 'VIDEO_TRUE_VIEW_IN_STREAM',
    Shopping: 'SHOPPING_PRODUCT_ADS',
  }
  return map[tactic] || 'SEARCH_STANDARD'
}

function CampaignPayload({ campaign, validationResult, index }) {
  const [open, setOpen] = useState(index === 0)
  const [copied, setCopied] = useState(false)
  const [launched, setLaunched] = useState(false)
  const payload = buildPayload(campaign)
  const json = JSON.stringify(payload, null, 2)

  const issues = validationResult?.issues || []
  const hasErrors = issues.some(i => i.status === 'err')
  const hasWarnings = issues.some(i => i.status === 'warn')

  function copy() {
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`border rounded-xl overflow-hidden ${launched ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {launched ? <CheckCircle size={18} className="text-green-600" /> :
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{index + 1}</span>}
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{campaign.campaign_name}</p>
          <p className="text-xs text-gray-500">{campaign.account_name} · {campaign.tactic} · ${campaign.daily_budget}/day</p>
        </div>
        <div className="flex items-center gap-2">
          {hasErrors && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Errors</span>}
          {!hasErrors && hasWarnings && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Warnings</span>}
          {launched && <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full font-semibold">Launched</span>}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="relative">
            <pre className="bg-gray-900 text-green-300 text-xs p-4 rounded-lg overflow-x-auto max-h-80 font-mono leading-relaxed">{json}</pre>
            <button
              onClick={copy}
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setLaunched(true)}
            disabled={launched || hasErrors}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors
              ${launched ? 'bg-green-100 text-green-700 cursor-default'
                : hasErrors ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            <Rocket size={16} />
            {launched ? 'Marked as Launched' : hasErrors ? 'Fix Errors Before Launching' : 'Mark as Launched'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Stage4Preview({ campaigns, validationResults, onBack, onRestart }) {
  function downloadAll() {
    const all = campaigns.map(buildPayload)
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `google-ads-campaigns-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{campaigns.length} campaign payload{campaigns.length !== 1 ? 's' : ''} ready</p>
        <button
          onClick={downloadAll}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm rounded-lg font-medium transition-colors"
        >
          <Download size={15} />
          Download All JSON
        </button>
      </div>

      {campaigns.map((c, i) => (
        <CampaignPayload
          key={c._id}
          campaign={c}
          validationResult={validationResults?.[i]}
          index={i}
        />
      ))}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">← Back</button>
        <button onClick={onRestart} className="px-6 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors">Start New Batch</button>
      </div>
    </div>
  )
}
