import { useState } from 'react'
import './App.css'
import logo from '/logo.png'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const models = ['Claude', 'Gemini', 'ChatGPT', 'Deepseek']
  return (
    <div>
      <link rel="icon" type="image/png" href="/logo.png" class="icon"></link>
      <h2>Prompt Catalyst</h2>
      <input
        className="prompt-input"
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
      />
    
      <div className="submit-button">
        <button >Submit</button>
      </div>

      <div className="model-selection"> 

        <select>
          <option value="">--Choose a model--</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
          </option>
          ))}
        </select>

      </div>
      
      <div className="output">
        <p>Output will be displayed here.</p>
        <output id="output"></output>
      </div>
      
    </div>
  )
}

