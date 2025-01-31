import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthForm from "./components/Auth/AuthForm";
import TeamView from "./components/Team/TeamView";
import TransferMarket from "./components/TransferMarket/TransferMarket";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/team" element={<TeamView />} />
          <Route path="/transfer-market" element={<TransferMarket />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
