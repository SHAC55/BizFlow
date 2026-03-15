import { useAuthContext } from "../context/AuthContext";
import { useLogout } from "../hooks/useAuth";
import {
  MdBusiness,
  MdPerson,
  MdPhone,
  MdEmail,
  MdLogout,
  MdVerified,
} from "react-icons/md";

const Dashboard = () => {
  const { user, isLoading } = useAuthContext();
  const { logout, isLoading: isLoggingOut } = useLogout();

  // loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // not logged in
  if (!user) {
    window.location.href = "/signin";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user.name || "User"}!
            </p>
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

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center space-x-4 mb-6">
            {/* Avatar */}
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
            {/* Username */}
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

            {/* Email */}
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

            {/* Phone */}
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

            {/* Business */}
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

        {/* Account Status Card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Account Status
          </h3>
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${user.verified ? "bg-green-500" : "bg-yellow-500"}`}
            ></div>
            <p className="text-gray-700">
              {user.verified ? (
                <span>
                  Your account is{" "}
                  <span className="text-green-600 font-semibold">verified</span>
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
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <p className="text-gray-700">
                Signed in via{" "}
                <span className="text-blue-600 font-semibold capitalize">
                  {user.provider}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
