import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Navbar from './Components/Navbar.jsx'
import AppleCom from './Components/AppleCom.jsx';
import Fruits from './Components/Fruits.jsx';

 


function App() {


  return (
    <>
      <h1>UG Real Estate</h1>
 
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppleCom />} />
        <Route path="/fruits" element={<Fruits />} />
        <Route path="/test" element={<div>Test Page</div>} />
        <Route path="/navbar" element={<Navbar />} />
      </Routes>
    </BrowserRouter>

    </>
  )
}

export default App
