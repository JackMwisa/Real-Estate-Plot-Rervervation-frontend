import React from 'react'
import { Link } from 'react-router-dom';

const Fruits = (props) => {
    return (
        <>



            <Link to="/ ">Home</Link>
            <Link to="/fruits">Fruits</Link>
            {/* Fruits: {props.color} {props.name === "Apple" ? "🍎" : "🍏"} */}
            <h1>{props.name} is {props.color}</h1>

        </>
    )
}

export default Fruits