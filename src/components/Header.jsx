import React from 'react'
import { Button } from '@/components/ui/button';
const Header = () => {
  return (
     <header className="bg-white border-b border-slate-200">
        <div className=" mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-around">
          <h1 className="text-2xl font-bold text-center text-slate-800">
            Crisp
          </h1>
          <ul className='flex justify-around gap-8 items-center'>
            <li className=' cursor-pointer'>
              About
            </li>
            <li className=' cursor-pointer'>
              Contact
            </li>
            <li>
              <Button>Login</Button>
            </li>
          </ul>
        </div>
      </header>
  )
}

export default Header