import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddItemButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/add-inventory")}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 active:scale-95"
    >
      <Plus size={18} />
      Add Item
    </button>
  );
};

export default AddItemButton;
