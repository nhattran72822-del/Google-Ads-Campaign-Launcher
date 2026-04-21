import { useState } from 'react'
import './index.css'
import Stage1Upload from './components/Stage1Upload'
import Stage2Configure from './components/Stage2Configure'
import Stage3Validate from './components/Stage3Validate'
import Stage4Preview from './components/Stage4Preview'
import ApiConnector from './components/ApiConnector'
import { Rocket, Plug } from 'lucide-react'

const STAGES = [
  { id: 1, label: 'Input & Upload' },
  { id: 2, label: 'Configure' },
  { id: 3, label: 'AI Validate' },
  { id: 4, label: 'Preview & Launch' },
]

export default function App() {
  const [view, setView] = useState('launcher') // 'launcher' | 'connector'
  const [stage, setStage] = useState(1)
  const [campaigns, setCampaigns] = useState([])
  const [validationResults, setValidationResults] = useState(null)

  function restart() {
    setCampaigns([])
    setValidationResults(null)
    setStage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Rocket size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-sm">Google Ads Campaign Launcher</span>
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button
              onClick={() => setView('launcher')}
              className={`flex items-center gap-1.5 px-4 py-2 transition-colors font-medium
                ${view === 'launcher' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Rocket size={14} /> Campaign Launcher
            </button>
            <button
              onClick={() => setView('connector')}
              className={`flex items-center gap-1.5 px-4 py-2 transition-colors font-medium border-l border-gray-200
                ${view === 'connector' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Plug size={14} /> API Connector
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'launcher' && (
          <div className="space-y-6">
            {/* Stage Progress Bar */}
            <div className="flex items-center gap-0">
              {STAGES.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                      ${stage > s.id ? 'bg-green-500 border-green-500 text-white'
                        : stage === s.id ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'}`}>
                      {stage > s.id ? '✓' : s.id}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block
                      ${stage === s.id ? 'text-blue-600' : stage > s.id ? 'text-green-600' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`h-0.5 flex-1 mb-5 transition-colors ${stage > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Stage Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Stage {stage} — {STAGES[stage - 1].label}
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                {stage === 1 && 'Upload a CSV file or load the sample data to get started.'}
                {stage === 2 && 'Review and edit each campaign\'s settings before validation.'}
                {stage === 3 && 'Run local or AI-powered validation to catch issues before launch.'}
                {stage === 4 && 'Preview the API-ready JSON payloads and mark campaigns as launched.'}
              </p>

              {stage === 1 && (
                <Stage1Upload onNext={rows => { setCampaigns(rows); setStage(2) }} />
              )}
              {stage === 2 && (
                <Stage2Configure
                  campaigns={campaigns}
                  onBack={() => setStage(1)}
                  onNext={updated => { setCampaigns(updated); setStage(3) }}
                />
              )}
              {stage === 3 && (
                <Stage3Validate
                  campaigns={campaigns}
                  onBack={() => setStage(2)}
                  onNext={(updated, results) => { setCampaigns(updated); setValidationResults(results); setStage(4) }}
                />
              )}
              {stage === 4 && (
                <Stage4Preview
                  campaigns={campaigns}
                  validationResults={validationResults}
                  onBack={() => setStage(3)}
                  onRestart={restart}
                />
              )}
            </div>
          </div>
        )}

        {view === 'connector' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Plug size={16} className="text-green-700" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Google Ads API Connector</h2>
              <span className="ml-auto text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">v22</span>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Connect your Google Ads credentials to test live API access and launch campaigns directly.
            </p>
            <ApiConnector />
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        Google Ads Campaign Launcher · Powered by React + Claude AI · API v22
      </footer>
    </div>
  )
}
