// App.jsx
import "./App.css";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CustomerProvider from "./context/CustomerProvider";    // ← import here

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RepPortal from "./pages/RepPortal";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import TransfersPage from "./pages/TransfersPage";
import ProfilePage from "./pages/ProfilePage";
import SupportPage from "./pages/SupportPage";
import SuppliesPage from "./pages/SuppliesPage";
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route
          path="/repportal"
          element={<ProtectedRoute><RepPortal /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/inventory"
          element={<ProtectedRoute><InventoryPage /></ProtectedRoute>}
        />
        <Route
          path="/transfers"
          element={<ProtectedRoute><TransfersPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/support"
          element={<ProtectedRoute><SupportPage /></ProtectedRoute>}
        />
        <Route
          path="/supplies"
          element={<ProtectedRoute><SuppliesPage /></ProtectedRoute>}
        />
      </Route>
    </>
  )
);

function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <RouterProvider router={router} />
      </CustomerProvider>
    </AuthProvider>
  );
}

export default App;
