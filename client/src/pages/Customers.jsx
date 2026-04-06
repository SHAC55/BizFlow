import React from "react";
import AllCustomer from "../components/AllCustomer";
import { User } from "lucide-react";
import PageHeader from "../components/PageHeader";

const Customers = () => {
  return (
    <div className="bg-gradient-to-br from-blue-100 to-indigo-50 w-screen ">
     
      <AllCustomer />
    </div>
  );
};

export default Customers;
