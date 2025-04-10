import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./component/HomePage";
import Purchase from "./component/PurchasesPage";
import LoginPage from "./component/LoginPage";
import RegistrationForm from "./component/RegisterPage";
import Trial from "./component/trial";
import FinalDraft from "./component/FinalDraft";
import RentPage from "./component/RentPage";
import SellerPage from "./component/SellerPage";
import UploadFarmForm from "./component/UploadFarmForm";
import UploadedFarms from "./component/UploadedFarms";
import Rents from "./component/Rents";
import Purchases from "./component/Purchases";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<Home />} />
      <Route path="/PurchasesPage" element={<Purchase />} />
      <Route path="/LoginPage" element={<LoginPage />} />
      <Route path="/RegisterPage" element={<RegistrationForm />} />
      <Route path="/Trial" element={<Trial />} />
      <Route path="/RentPage" element={< RentPage />} />
      <Route path="/farm/:id" element={<FinalDraft />} />
      <Route path="/SellerPage" element={< SellerPage />} />
      <Route path="/UploadFarmForm" element={< UploadFarmForm />} />
      <Route path="/UploadedFarms" element={< UploadedFarms />} />
      <Route path="/Rents" element={< Rents />} />
      <Route path="/Purchases" element={< Purchases />} />
    </Routes>
  );
}

export default App;
