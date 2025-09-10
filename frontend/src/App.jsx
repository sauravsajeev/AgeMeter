
import './App.css'
import { Routes, Route, Link } from "react-router-dom"
import { useEffect } from "react"
import Home from "./pages/Home/Home"
// import Goals from "./pages/Goals/Goals"
// import Profile from "./pages/Profile/Profile"
import LightRays from './components/LightRays/LightRays';
function App() {
  

  return (
    <>
     <div
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0, // background
        }}
      >
        <LightRays
           variant="circle"
  colorStops={["#ffffff", "#000000","#959494"]}
  blend={0.5}
  amplitude={1.0}
  speed={0.5}
        />
      </div>

      {/* Foreground layer for app content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/goals" element={<Goals />} />
          <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </div>
    </>
  )
}

export default App
