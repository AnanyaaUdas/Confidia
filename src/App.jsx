import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./style/global.css";

import Home from "./pages/Home";
import Wall from "./pages/Wall";
import Write from "./pages/Write";
import Badges from "./pages/Badges";

function App() {
  return (
    <>
   
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wall" element={<Wall />} />
        <Route path="/write" element={<Write />} />
        <Route path="/badges" element={<Badges />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;