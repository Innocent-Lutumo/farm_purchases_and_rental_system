import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./component/HomePage";
import Purchase from "./component/PurchasesPage";
import LoginPage from "./component/LoginPage";
import RegistrationForm from "./component/RegisterPage";
import Trial from "./component/trial";
import FinalDraft from "./component/FinalDraft";
import SellerPage from "./component/SellerPage";
import UploadFarmForm from "./component/UploadFarmForm";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<Home />} />
      <Route path="/PurchasesPage" element={<Purchase />} />
      <Route path="/LoginPage" element={<LoginPage />} />
      <Route path="/RegisterPage" element={<RegistrationForm />} />
      <Route path="/Trial" element={<Trial />} />
      <Route path="/farm/:id" element={<FinalDraft />} />
      <Route path="/SellerPage" element={< SellerPage />} />
      <Route path="/UploadFarmForm" element={< UploadFarmForm />} />
    </Routes>
  );
}

export default App;
