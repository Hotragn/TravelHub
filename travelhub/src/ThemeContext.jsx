// ThemeContext.js
import { createContext, useEffect, useState } from "react";
export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "blue");
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);
  const toggleTheme = (t) => {
    setTheme(t);
    localStorage.setItem("theme", t);
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
