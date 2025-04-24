import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./component/HomePage";
import Purchase from "./component/PurchasesPage";
import LoginPage from "./component/LoginPage";
import RegistrationForm from "./component/RegisterPage";
import Trial from "./component/trial";
import FinalDraft from "./component/FinalDraft";
import FinalDraft1 from "./component/FinalDraft1";
import RentPage from "./component/RentPage";
import SellerPage from "./component/SellerPage";
import UploadFarmForm from "./component/UploadFarmForm";
import UploadedFarms from "./component/UploadedFarms";
import Rents from "./component/Rents";
import Purchases from "./component/Purchases";
import Appp from "./component/lee.js"

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
      <Route path="/farm1/:id" element={< FinalDraft1 />} />
      <Route path="/SellerPage" element={< SellerPage />} />
      <Route path="/uploadFarmForm" element={< UploadFarmForm />} />
      <Route path="/uploadedfarms" element={< UploadedFarms />} />
      <Route path="/Rents" element={< Rents />} />
      <Route path="/Purchases" element={< Purchases />} />
      <Route path="/lee" element={< Appp />} />
    </Routes>
  );
}

export default App;
