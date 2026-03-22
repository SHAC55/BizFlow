import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddItemButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/add-item")}
      className="flex items-center gap-2 px-4 py-2 rounded-xl
                 h-20 w-38 m-3 
                 text-white text-sm font-medium
                 bg-blue-600
                 hover:from-blue-600 hover:to-blue-500
                 active:scale-95
                 transition-all duration-200
                 shadow-sm hover:shadow-md"
    >
      <Plus size={18} />
      Add Item
    </button>
  );
};

export default AddItemButton;