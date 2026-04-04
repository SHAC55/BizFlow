import React from "react";
import AddItemButton from "../components/AddItemButton";
import InventoryProducts from "../components/InventoryProducts";

const Inventory = () => {
  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 md:ml-72 md:mt-0 mt-16 min-w-[350px]">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <AddItemButton />
      </div>
      <InventoryProducts />
    </div>
  );
};

export default Inventory;
