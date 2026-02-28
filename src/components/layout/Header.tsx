import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CurrencySelector } from "@/components/ui/currency-selector";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userType, signOut } = useAuth();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Housing", path: "/properties" },
    { name: "List Your Property", path: "/list-property" },
  ];

  // Determine which dashboard to link to based on user type
  const getDashboardUrl = () => {
    if (userType === "admin") return "/dashboard/admin";
    // All other users (including former "agent" users) go to user dashboard
    return "/dashboard/user";
  };

  return (
    <header className="bg-white/90 dark:bg-realty-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-realty-800/50 shadow-sm transition-all duration-300">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="h-9 w-9 bg-gradient-to-br from-realty-800 to-realty-900 dark:from-realty-gold dark:to-realty-gold/80 rounded-md flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105">
              <span className="text-white dark:text-realty-900 font-bold text-lg">CC</span>
            </div>
            <span className="text-xl font-heading font-bold text-realty-900 dark:text-white tracking-tight transition-colors duration-300 group-hover:text-realty-700 dark:group-hover:text-realty-gold">
              Campus Comfort
            </span>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 desktop-navigation">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-all duration-300 relative group",
                  location.pathname === item.path
                    ? "text-realty-900 dark:text-white font-semibold"
                    : "text-realty-600 dark:text-realty-400 hover:text-realty-800 dark:hover:text-realty-200"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-realty-gold transition-all duration-300 group-hover:w-full",
                  location.pathname === item.path ? "w-full" : "w-0"
                )}></span>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <CurrencySelector
              variant="select"
              size="sm"
              showFlag={true}
              className="w-28"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-realty-200 dark:border-realty-700 hover:bg-realty-50 dark:hover:bg-realty-800 transition-all duration-300"
                  asChild
                >
                  <Link to={getDashboardUrl()}>
                    <User className="h-4 w-4 mr-2 text-realty-600 dark:text-realty-300" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-realty-200 dark:border-realty-700 hover:bg-realty-50 dark:hover:bg-realty-800 transition-all duration-300"
                  asChild
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-realty-800 to-realty-900 hover:from-realty-700 hover:to-realty-800 text-white shadow-sm hover:shadow transition-all duration-300 dark:from-realty-gold dark:to-realty-gold/90 dark:text-realty-900"
                  asChild
                >
                  <Link to="/user-signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden mobile-menu-button">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Enhanced */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-realty-900/95 backdrop-blur-md border-b border-gray-200 dark:border-realty-800 animate-fade-in shadow-lg">
          <div className="container-custom py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "px-2 py-2 text-sm font-medium rounded-md",
                    location.pathname === item.path
                      ? "text-realty-900 dark:text-white bg-muted"
                      : "text-realty-600 dark:text-realty-400"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {user && (
                <Link
                  to={getDashboardUrl()}
                  className="px-2 py-2 text-sm font-medium rounded-md text-realty-600 dark:text-realty-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </nav>
            <div className="pt-4 border-t border-gray-200 dark:border-realty-800 flex flex-col space-y-3">
              <div className="mb-3">
                <CurrencySelector
                  variant="select"
                  size="sm"
                  showFlag={true}
                />
              </div>
              {user ? (
                <Button
                  variant="outline"
                  className="justify-center"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    className="justify-center"
                    asChild
                  >
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    className="justify-center bg-gradient-to-r from-realty-800 to-realty-900 hover:from-realty-700 hover:to-realty-800 text-white shadow-sm hover:shadow transition-all duration-300 dark:from-realty-gold dark:to-realty-gold/90 dark:text-realty-900"
                    asChild
                  >
                    <Link to="/user-signup" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;