import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'
import AppleCom from './components/AppleCom.jsx';
import Fruits from './components/Fruits.jsx';

function App() {


  return (
    <>
      <h1>UG Real Estate</h1>
      <h2>Plot Reservation System</h2>
      <h3>Welcome to the Plot Reservation System</h3>
      {/* <h4>Reserve your plot today!</h4>
      <h5>Contact us for more information</h5>
      <h6>Thank you for visiting</h6> */}

      <Navbar />
      <AppleCom />
      <Fruits name="Apple" color="red" />
      <Fruits name="Green Apple" color="green" />
      {/* <TestComponent /> */}

    </>
  )
}

export default App
