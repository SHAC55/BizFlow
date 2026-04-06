import React from "react";
import AddItemButton from "../components/AddItemButton";
import InventoryProducts from "../components/InventoryProducts";
import PageHeader from "../components/PageHeader";
import { Package } from "lucide-react";

const Inventory = () => {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-100 to-indigo-50 md:ml-72 md:mt-0 mt-16 min-w-[350px]">
      {/* <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <AddItemButton />
      </div> */}
      <PageHeader title="Inventory" icon={Package} />
      <InventoryProducts />
    </div>
  );
};

export default Inventory;
