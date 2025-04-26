import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";

function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Theme and feed content toggles from context
  const { theme, toggleTheme, showDetails, toggleShowDetails } =
    useContext(ThemeContext);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${searchTerm}`);
    setMenuOpen(false);
  };

  // Close mobile menu on navigation
  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-container">
        <Link to="/" className="logo" tabIndex={0}>
          TravelHub
        </Link>

        <form className="search-bar" onSubmit={handleSearch} role="search">
          <input
            type="text"
            aria-label="Search posts"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        {/* Theme and feed toggles */}
        <div className="navbar-controls">
          {/* Theme selector */}
          <select
            className="theme-select"
            value={theme}
            onChange={(e) => toggleTheme(e.target.value)}
            aria-label="Select color scheme"
          >
            <option value="blue">Blue</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          {/* Feed content toggle */}
          <label className="show-details-toggle" style={{ marginLeft: "16px" }}>
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => toggleShowDetails(e.target.checked)}
              aria-label="Show content and images in feed"
            />
            <span style={{ marginLeft: "4px" }}>Show details</span>
          </label>
        </div>

        {/* Desktop Links */}
        <ul className="nav-links" role="menubar">
          <li>
            <Link to="/" className="nav-link" role="menuitem" tabIndex={0}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/create"
              className="nav-link"
              role="menuitem"
              tabIndex={0}
            >
              Create New Post
            </Link>
          </li>
        </ul>

        {/* Hamburger for mobile */}
        <button
          className="navbar-menu-btn"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-menu-icon">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <ul className="nav-links-mobile" id="mobile-menu" role="menubar">
          <li>
            <Link
              to="/"
              className="nav-link"
              role="menuitem"
              tabIndex={0}
              onClick={handleNavClick}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/create"
              className="nav-link"
              role="menuitem"
              tabIndex={0}
              onClick={handleNavClick}
            >
              Create New Post
            </Link>
          </li>
          <li>
            <label
              className="show-details-toggle"
              style={{ marginLeft: "8px" }}
            >
              <input
                type="checkbox"
                checked={showDetails}
                onChange={(e) => toggleShowDetails(e.target.checked)}
                aria-label="Show content and images in feed"
              />
              <span style={{ marginLeft: "4px" }}>Show details</span>
            </label>
          </li>
          <li>
            <select
              className="theme-select"
              value={theme}
              onChange={(e) => toggleTheme(e.target.value)}
              aria-label="Select color scheme"
            >
              <option value="blue">Blue</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
