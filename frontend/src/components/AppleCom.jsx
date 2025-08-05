 import React from 'react'
 
 const AppleCom = () => {

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

      <h1>{DisplayApples(-9)}</h1>
     
     </>
   )
 }
 
 export default AppleCom