import React from 'react'
import Header from '../components/Header'
import InventoryProducts from '../components/InventoryProducts'

const Inventory = () => {
  return (
    <div className='bg-white text-black  mb-3 mr-3 w-full rounded-3xl p-2 md:ml-20 md:mt-2 mt-14 min-h-screen'>
      <Header title="Inventory" para="Add,Manage and track stock and inventory"/>
      <InventoryProducts/>
    </div>
  )
}

export default Inventory
// import React from "react";
// import AddItemButton from "../components/AddItemButton";
// import InventoryProducts from "../components/InventoryProducts";
// import PageHeader from "../components/PageHeader";
// import { Package } from "lucide-react";

// const Inventory = () => {
//   return (
//     <div className="w-screen h-screen bg-gradient-to-br from-blue-100 to-indigo-50 md:ml-72 md:mt-0 mt-16 min-w-[350px]">
      
//       <PageHeader title="Inventory" icon={Package} />
//       <InventoryProducts />
//     </div>
//   );
// };

// export default Inventory;
