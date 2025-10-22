import { Moon, Sun, Cloud } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background h-16 flex items-center px-6">
      <div className="flex items-center gap-3">
        <Cloud className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold">Nebula</h1>
      </div>

      <nav className="flex items-center gap-2 ml-8">
        <Link to="/">
          <Button
            variant={location.pathname === "/" ? "secondary" : "ghost"}
            size="sm"
          >
            Generator
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button
            variant={location.pathname === "/dashboard" ? "secondary" : "ghost"}
            size="sm"
          >
            Dashboard
          </Button>
        </Link>
        <Link to="/observability">
          <Button
            variant={location.pathname === "/observability" ? "secondary" : "ghost"}
            size="sm"
          >
            Observability
          </Button>
        </Link>
      </nav>

      <div className="ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
