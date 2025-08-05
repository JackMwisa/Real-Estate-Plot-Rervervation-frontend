import React from 'react'

const Fruits = (props) => {
  return (
    <>
    {/* Fruits: {props.color} {props.name === "Apple" ? "🍎" : "🍏"} */}
    <h1>{props.name} is {props.color}</h1>
 
    </>
  )
}

export default Fruits