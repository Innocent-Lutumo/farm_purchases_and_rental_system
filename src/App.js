import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './component/HomePage';
import Pome from './component/PurchasesPage';
import LoginPage from './component/LoginPage';
import RegistrationForm from './component/RegisterPage';


function App() {
  return (
      <Routes>
        <Route path="/*" element={< Home />} />
        <Route path="/ExamplePage" element={< Pome />} />
        <Route path="/LoginPage" element={< LoginPage />} />
        <Route path="/RegisterPage" element={< RegistrationForm />} />
      </Routes>
  );
}

export default App;
