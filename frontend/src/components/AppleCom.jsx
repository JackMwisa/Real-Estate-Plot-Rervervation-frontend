 import React, {useState} from 'react'
 
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

   return (
     <>

      <h1>{DisplayApples(numberOfApples)}</h1>
     
     </>
   )
 }
 
 export default AppleCom