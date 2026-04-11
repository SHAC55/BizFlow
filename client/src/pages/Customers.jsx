import React from "react";
import Header from "../components/Header";
import PageLoader from "../components/loaders/PageLoader";
import { useCustomers } from "../hooks/useCustomers";
import AllCustomer from "../components/AllCustomer";

const Customers = () => {


    const { isLoading } = useCustomers();
  if (isLoading ) return <PageLoader />;

  return (
    <div className="bg-white text-black  mb-3 mr-3 w-full rounded-3xl p-2 md:ml-20 md:mt-2 mt-14 min-h-screen">
      <Header title="Customer" para="Manage  your  customer details like payment,Transaction  and every due."/>
      <AllCustomer/>
    </div>
  );
};

export default Customers;

