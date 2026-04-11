import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useLogout } from "../hooks/useAuth";
import { useUpdateBusiness } from "../hooks/useBusiness";
import {
  MdBusiness,
  MdPerson,
  MdPhone,
  MdEmail,
  MdLogout,
  MdVerified,
  MdReceiptLong,
  MdLocationOn,
} from "react-icons/md";

const Profile = () => {
  const { user, isLoading } = useAuthContext();
  const { logout, isLoading: isLoggingOut } = useLogout();
  const { updateBusiness, isLoading: isSavingBusiness, error: businessError } =
    useUpdateBusiness();
  const [businessForm, setBusinessForm] = useState({
    name: "",
    gstNumber: "",
    address: "",
  });

  useEffect(() => {
    setBusinessForm({
      name: user?.business?.name || "",
      gstNumber: user?.business?.gstNumber || "",
      address: user?.business?.address || "",
    });
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 w-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/signin";
    return null;
  }

  const handleBusinessSubmit = async (event) => {
    event.preventDefault();
    await updateBusiness(businessForm);
  };

  return (
    <div className="w-screen">
      <div className="min-h-screen w-full bg-black p-6 md:mt-0 mt-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-200">User Profile</h1>
              <p className="text-gray-300 mt-1">{user.name || "User"}!</p>
            </div>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdLogout size={20} />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-800">
                    {user.name || "-"}
                  </h2>
                  {user.verified && (
                    <MdVerified
                      className="text-blue-500"
                      size={20}
                      title="Verified"
                    />
                  )}
                </div>
                <p className="text-gray-500 text-sm">
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MdPerson className="text-blue-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Username
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {user.name || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MdEmail className="text-purple-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {user.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MdPhone className="text-green-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Mobile
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {user.mobile || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MdBusiness className="text-orange-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Business
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {user.business?.name || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Account Status
            </h3>
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${user.verified ? "bg-green-500" : "bg-yellow-500"}`}
              />
              <p className="text-gray-700">
                {user.verified ? (
                  <span>
                    Your account is{" "}
                    <span className="text-green-600 font-semibold">
                      verified
                    </span>
                  </span>
                ) : (
                  <span>
                    Your account is{" "}
                    <span className="text-yellow-600 font-semibold">
                      pending verification
                    </span>
                  </span>
                )}
              </p>
            </div>
            {user.provider && (
              <div className="mt-3 flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <p className="text-gray-700">
                  Signed in via{" "}
                  <span className="text-blue-600 font-semibold capitalize">
                    {user.provider}
                  </span>
                </p>
              </div>
            )}
          </div>

          <form
            onSubmit={handleBusinessSubmit}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <MdReceiptLong className="text-slate-700" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Invoice Business Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Add GST and billing address here after signup so invoices and
                  reminder messages use the correct business identity.
                </p>
              </div>
            </div>

            {businessError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {businessError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Business Name
                </span>
                <input
                  value={businessForm.name}
                  onChange={(event) =>
                    setBusinessForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  GST Number
                </span>
                <input
                  value={businessForm.gstNumber}
                  onChange={(event) =>
                    setBusinessForm((current) => ({
                      ...current,
                      gstNumber: event.target.value,
                    }))
                  }
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 focus:bg-white"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Business Address
                </span>
                <textarea
                  value={businessForm.address}
                  onChange={(event) =>
                    setBusinessForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Billing address for invoices"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <MdLocationOn className="text-blue-600 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Invoice readiness
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {user.business?.gstNumber && user.business?.address
                      ? "GST and address are available for invoice generation."
                      : "Add GST and business address so invoice printouts include complete billing details."}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingBusiness}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
            >
              {isSavingBusiness ? "Saving..." : "Save Business Details"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
