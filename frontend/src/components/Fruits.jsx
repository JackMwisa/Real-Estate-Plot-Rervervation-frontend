import React from 'react'

const Fruits = (props) => {
  return (
    <>
    Fruits: {props.color} {props.name === "Apple" ? "🍎" : "🍏"}
    <p>Fruits are healthy and delicious!</p>
    </>
  )
}

export default Fruits