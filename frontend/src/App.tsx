import { Routes, Route, Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <h1>Dynamic Form Builder</h1>
      <Link to="/builder">Go to Builder</Link>
    </div>
  )
}

function Builder() {
  return (
    <div>
      <h2>Form Builder</h2>
      <Link to="/">Back to Home</Link>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/builder" element={<Builder />} />
    </Routes>
  )
}

export default App
