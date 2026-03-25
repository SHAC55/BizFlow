import React from 'react'
import AddItemButton from '../components/AddItemButton'
import InventoryProducts from '../components/InventoryProducts'

const Inventory = () => {
  return (
    <div className='w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100 md:ml-72 md:mt-0 mt-12 min-w-[350px]'>
      {/* <AddItemButton/> */}
      <InventoryProducts/>
    </div>
  )
}

export default Inventory
