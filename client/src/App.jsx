import React from 'react'
import { Routes,Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import { Toaster } from "react-hot-toast";
import Privacy from './pages/Privacy';
import SignIn from './pages/SIgnIn';
import SignUp from './pages/SignUp';


const App = () => {
  return (
    <div>
       <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>

    </div>
  )
}

export default App
