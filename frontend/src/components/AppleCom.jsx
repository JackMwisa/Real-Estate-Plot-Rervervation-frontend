import React, { useState } from 'react'
import { Link } from 'react-router-dom';


const AppleCom = () => {

    const [numberOfApples, setNumberOfApples] = useState(0);

    const DisplayApples = (numberOfApples) => {
        if (numberOfApples === 0) {
            return 'No apples';
        }
        if (numberOfApples === 1) {
            return 'One apple';
        }
        return `${numberOfApples} apples`;
    }

    const incrementApples = () => {
        setNumberOfApples(numberOfApples + 1);
    }

    const decrementApples = () => {
        setNumberOfApples(numberOfApples - 1);
        if (numberOfApples < 1) {
            setNumberOfApples(0);
        }
    }


    const TooManyApples = () => {
        if (numberOfApples > 10) {
            return <h1>I have too many apples</h1>;
        }
        return null;
    }

    return (
        <>


            <Link to="/ ">Home</Link>
            <Link to="/fruits">Fruits</Link>




            <h1>Number of apples: {numberOfApples}</h1>
            <button onClick={incrementApples} style={{ backgroundColor: 'green', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', display: numberOfApples < 10 ? 'inline-block' : 'none' }}>Add Apple</button>
            <button onClick={decrementApples} style={{ backgroundColor: 'red', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', display: numberOfApples > 0 ? 'inline-block' : 'none' }}>Remove Apple</button>

            {TooManyApples()}

            {numberOfApples > 9 ? <h1>I have too many apples</h1> : null}


            {/* <a href="/fruits">Go to Fruits</a> */}

        </>
    )
}

export default AppleCom