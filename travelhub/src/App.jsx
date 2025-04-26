// App.jsx
import { createContext, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/NavBar";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import Home from "./pages/Home";
import PostPage from "./pages/PostPage";
import { ThemeProvider } from "./ThemeContext";

// UserContext for user ID (pseudo-auth)
export const UserContext = createContext();
// Create a loading context to share loading state
export const LoadingContext = createContext();

// Simple Loader component
const Loader = () => (
  <div className="loader-overlay">
    <div className="loader"></div>
  </div>
);

function App() {
  // Generate or retrieve a unique user ID for the session
  const [userId] = useState(() => {
    let uid = localStorage.getItem("userId");
    if (!uid) {
      uid = window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `user-${Date.now()}`;
      localStorage.setItem("userId", uid);
    }
    return uid;
  });

  // For a loading spinner (can be used in pages)
  const [loading, setLoading] = useState(false);

  return (
    <ThemeProvider>
      <UserContext.Provider value={userId}>
        <LoadingContext.Provider value={{ loading, setLoading }}>
          <div className="app">
            <Navbar />
            <div className="container">
              {loading && <Loader />}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/posts/:id" element={<PostPage />} />
                <Route path="/posts/:id/edit" element={<EditPost />} />
              </Routes>
            </div>
          </div>
        </LoadingContext.Provider>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export default App;
