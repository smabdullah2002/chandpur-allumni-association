import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminUsers from "./pages/AdminUsers";
import AdminNotices from "./pages/AdminNotices";
import AdminDonations from "./pages/AdminDonations";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAbout from "./pages/AdminAbout";
import AdminSliders from "./pages/AdminSliders";
import AdminFeeCategories from "./pages/AdminFeeCategories";
import AdminGallery from "./pages/AdminGallery";
import AdminRoles from "./pages/AdminRoles";
import AdminEvents from "./pages/AdminEvents";
import AdminExecutive from "./pages/AdminExecutive";
import Gallery from "./pages/Gallery";
import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";
import AddDonation from "./pages/AddDonation";
import Notice from "./pages/Notice";
import Profile from "./pages/Profile";
import ImpactReport from "./pages/ImpactReport";
import ResetPassword from "./pages/ResetPassword";
import Members from "./pages/Members";
import Executive from "./pages/Executive";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/impact" element={<ImpactReport />} />
        <Route path="/register" element={<Register />} />
        <Route path="/members" element={<Members />} />
        <Route path="/executive" element={<Executive />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/about"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminAbout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminRoles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notices"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminNotices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/executive"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminExecutive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/donations"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminDonations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fee-categories"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminFeeCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sliders"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminSliders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="super-admin">
              <AdminSliders />
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donations"
          element={
            <ProtectedRoute requiredRole="user">
              <Donations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donations/new"
          element={
            <ProtectedRoute requiredRole="user">
              <AddDonation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notice"
          element={
            <ProtectedRoute requiredRole="user">
              <Notice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="user">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
