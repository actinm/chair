import React from 'react';
import chair from './chair'
import { useEffect } from 'react';

function Index() {

  useEffect(()=>{
    chair(document.querySelector('.ipod'))
  },[])
  return (
    <div className='w-[100%] h-[100%] ipod' >
    </div>
  );
}

export default React.memo(Index);