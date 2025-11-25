import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Home, BarChart3, CreditCard, Settings, Activity } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-black/50 backdrop-blur-md border-b border-gray-900/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Search className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dream Consultas
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button
              asChild
              variant={location.pathname === "/" || location.pathname === "/home" ? "default" : "ghost"}
              className="flex items-center space-x-2"
            >
              <Link to="/home">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>
            
            <Button
              asChild
              variant={location.pathname === "/dashboard" ? "default" : "ghost"}
              className="flex items-center space-x-2"
            >
              <Link to="/dashboard">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>

            <Button
              asChild
              variant={location.pathname === "/planos" ? "default" : "ghost"}
              className="flex items-center space-x-2"
            >
              <Link to="/planos">
                <CreditCard className="h-4 w-4" />
                <span>Planos</span>
              </Link>
            </Button>

            <Button
              asChild
              variant={location.pathname === "/utils" ? "default" : "ghost"}
              className="flex items-center space-x-2"
            >
              <Link to="/utils">
                <Activity className="h-4 w-4" />
                <span>Utils</span>
              </Link>
            </Button>

            <Button
              asChild
              variant={location.pathname === "/panel" ? "default" : "ghost"}
              className="flex items-center space-x-2"
            >
              <Link to="/panel">
                <Settings className="h-4 w-4" />
                <span>Panel</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 