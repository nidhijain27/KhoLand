import * as React from 'react';
import { HashRouter, Routes, Route } from "react-router-dom";
import {KholandSpace} from "./pages/KholandSpace";
import {AvatarSelection} from "./pages/AvatarSelection/AvatarSelection";
import {LudoScreen} from "./pages/LudoScreen/LudoScreen";

export default function App() {
  return (
    <HashRouter basename={"/"}>
      <Routes>
        <Route path="/meta" element={<KholandSpace />} />
        <Route path="/avatar" element={<AvatarSelection/>} /> 
        <Route path="/ludo" element={<LudoScreen/>} />
      </Routes>
    </HashRouter>
  );
}
