import { useState } from 'react'
import { FaCopy } from 'react-icons/fa6'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://prompt-catalyst-api.vercel.app'

function ModelSelection({ selectedModel, onChange }) {
  const models = ['Claude', 'Gemini', 'ChatGPT', 'Deepseek']

  return (
    <div className="model-selection">
      <label className="field-label" htmlFor="model-select">
        Target model
      </label>
      <select id="model-select" className="model-select" value={selectedModel} onChange={onChange}>
        <option value="" disabled>
          --Choose a model--
        </option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  )
}

function CopyBtn({ output }) {
  return (
    <div className="output-panel">
      <button
        type="button"
        className="copy-icon-btn"
        aria-label="Copy output"
        disabled={!output}
        onClick={() => {
          if (output && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(output)
          }
        }}
      >
        <FaCopy className="copy-icon" />
      </button>
      <div className="output-content">
        <p className="placeholder">{output ? 'Optimized output' : 'Output will be displayed here.'}</p>
        <output id="output" aria-live="polite">
          {output}
        </output>
      </div>
    </div>
  )
}

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!prompt.trim() || !selectedModel) return

    setLoading(true)
    setResult('')
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/prompt/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel
        })
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Unable to optimize prompt right now.')
      }

      setResult(data.optimizedPrompt)
    } catch (caughtError) {
      setError(caughtError.message || 'Something went wrong while contacting the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="eyebrow">AI Prompt Optimizer</span>
        <h2>Prompt Catalyst</h2>
        <p className="app-subtitle">Optimize your prompt for the model you choose.</p>
      </header>

      <form className="prompt-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="prompt-input">
          Prompt
        </label>
        <textarea
          id="prompt-input"
          className="prompt-input"
          rows="4"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
        />

        <div className="submit-button">
          <button type="submit" disabled={loading}>
            {loading ? 'Optimizing...' : 'Submit'}
          </button>
        </div>
      </form>

      <ModelSelection selectedModel={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} />
      <CopyBtn output={result} />
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}

