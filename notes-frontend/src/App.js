import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import NotePage from "./pages/NotePage";
import ToDoPage from "./pages/ToDoPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route shows Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Auth routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Notes and Todos */}
        <Route path="/notes" element={<NotePage />} />
        <Route path="/todos" element={<ToDoPage />} />
        <Route path="/notes/:id" element={<NotePage />} />
      </Routes>
    </Router>
  );
}

export default App;
