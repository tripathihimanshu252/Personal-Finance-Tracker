import { Navigate, Outlet } from "react-router-dom";

import Navbar from "./Navbar";

const ProtectedRoute = () => {

  const token = localStorage.getItem("token");

  // No Token → Redirect

  if (!token) {

    return <Navigate to="/login" replace />;

  }

  return (

    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        <Outlet />

      </main>

    </div>

  );
};

export default ProtectedRoute;