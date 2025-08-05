import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'

function App() {

  function myFunction() {
    alert('Hello World');
  }

  const myComponent = () => {
    return <h1>This is a component</h1>;
  }

  const DisplayApples = (n) => {
    if (n === 0) {
      return 'No apples';
    }
    if (n === 1) {
      return 'One apple';
    }
    return `${n} apples`;
  }

  return (
    <>
      <h1>This is an h1</h1>
      <p>this is is a paragraph</p>
      {myComponent()}
      <button onClick={myFunction}>Click me</button>

      <myComponent />
      <myComponent />

      {myComponent()}

      <Navbar />

      <h1>{DisplayApples(-9)}</h1>

    </>
  )
}

export default App
