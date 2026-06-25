import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import FundDetail from './pages/FundDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/fund/:code" element={<FundDetail />} />
    </Routes>
  );
}
