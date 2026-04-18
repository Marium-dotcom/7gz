// getHero()

import { getHero } from '@/libs/actions/hero';
import React from 'react'

export const    Hero = async () => {
    // fetch hero data from server and display it here
    
    const hero = await getHero();
    console.log('====================================');
    console.log(hero);
    console.log('====================================');
  return (
    <div>


    </div>
  )
}
