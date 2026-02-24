import { useState } from "react";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setAuthenticated(false)} />;
};

export default Index;
