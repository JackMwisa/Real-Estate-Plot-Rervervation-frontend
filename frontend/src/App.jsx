import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'
import AppleCom from './components/AppleCom.jsx';
import Fruits from './components/Fruits.jsx';

const theFruits = [
  {id: 1, name: "Apple", color: "red"},
  {id: 2, name: "Green Apple", color: "green"},
  {id: 3, name: "Banana", color: "yellow"},
  {id: 4, name: "Orange", color: "orange"},
  {id: 5, name: "Grapes", color: "purple"},
  {id: 6, name: "Mango", color: "yellow"},
  {id: 7, name: "Pineapple", color: "brown"},
  {id: 8, name: "Strawberry", color: "red"},
  {id: 9, name: "Blueberry", color: "blue"},
  {id: 10, name: "Watermelon", color: "green"},
  {id: 11, name: "Peach", color: "pink"},
  {id: 12, name: "Plum", color: "purple"},
  {id: 13, name: "Kiwi", color: "brown"},
  {id: 14, name: "Papaya", color: "orange"},
  {id: 15, name: "Cherry", color: "red"},
]



function App() {


  return (
    <>
      <h1>UG Real Estate</h1>

      {/* <h4>Reserve your plot today!</h4>
      <h5>Contact us for more information</h5>
      <h6>Thank you for visiting</h6> */}


      {/* <Fruits name="Apple" color="red" />
      <Fruits name="Green Apple" color="green" /> */}
      {/* <TestComponent /> */}


      {/* {theFruits.map(
        (fruit) => (
          <>
          <h5 key={fruit.id}>{fruit.name} is {fruit.color}</h5>
          <Fruits key={fruit.id} name={fruit.name} color={fruit.color} />
        </>
        )
      )} */}

      <AppleCom />

    </>
  )
}

export default App
