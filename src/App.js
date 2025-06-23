import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./component/Common/HomePage";
import Purchase from "./component/Renter/PurchasesPage";
import Purchases2 from "./component/Buyer/PurchasesPage2";
import LoginPage from "./component/Common/LoginPage";
import RegistrationForm from "./component/Common/RegisterPage";
import Trial from "./component/Buyer/trial";
import RentPage from "./component/Renter/RentPage";
import SellerPage from "./component/Seller/SellerPage";
import UploadFarmForm from "./component/Seller/UploadFarmForm";
import UploadedFarms from "./component/Seller/UploadedFarms";
import Rents from "./component/Seller/Rents";
import Purchases from "./component/Seller/Purchases";
import ProtectedRoute from "./component/Common/ProtectedRoute";
import AdminProtectedRoute from "./component/Admin/AdminProtectedRoutes";
import RentalAgreement from "./component/Renter/RentalAgreement";
import PurchaseAgreement from "./component/Buyer/PurchaseAgreement";
import AdminDashboard from "./component/Admin/Dashboard";
import AdminLogin from "./component/Admin/AdminLogin";
import SellerList from "./component/Admin/SellerList";
import ResetPasswordConfirmPage from "./component/Common/ResetPasswordConfirmPage";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// import FarmNavigationMap from "./component/lee.js";

function App() {
  return (
    <>
      <Routes>
        <Route path="/*" element={<Home />} />
        <Route path="/PurchasesPage" element={<Purchase />} />
        <Route path="/PurchasesPage2" element={<Purchases2 />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/RegisterPage" element={<RegistrationForm />} />
        <Route path="/Trial" element={<Trial />} />
        <Route path="/RentPage" element={<RentPage />} />
        <Route path="/RentalAgreement" element={<RentalAgreement />} />
        <Route path="/PurchaseAgreement" element={<PurchaseAgreement />} />
        <Route path="AdminLogin" element={<AdminLogin />} />
        <Route path="/password-reset/:uid/:token" element={<ResetPasswordConfirmPage />} />
        <Route
          path="/SellerPage"
          element={
            <ProtectedRoute>
              <SellerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/UploadFarmForm"
          element={
            <ProtectedRoute>
              <UploadFarmForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/UploadedFarms"
          element={
            <ProtectedRoute>
              <UploadedFarms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Rents"
          element={
            <ProtectedRoute>
              <Rents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Purchases"
          element={
            <ProtectedRoute>
              <Purchases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/SellerList"
          element={
            <AdminProtectedRoute>
              <SellerList />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
