import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "../ThemeContext";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState("created_at");
  const [flagFilter, setFlagFilter] = useState("");
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // Theme and display preferences from context
  const { showDetails, toggleShowDetails, theme, toggleTheme } =
    useContext(ThemeContext);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [orderBy, searchTerm, flagFilter]);

  async function fetchPosts() {
    setLoading(true);

    let query = supabase.from("posts").select("*");

    // Apply search filter if there's a search term
    if (searchTerm) {
      query = query.ilike("title", `%${searchTerm}%`);
    }

    // Apply flag filter if selected
    if (flagFilter) {
      query = query.eq("flag", flagFilter);
    }

    // Apply sorting
    query = query.order(orderBy, { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  }

  return (
    <div>
      {/* Interface customization options */}
      <div
        className="filter-options"
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        {/* Sort buttons */}
        <div className="sort-container">
          <span className="sort-label">Order by:</span>
          <div className="sort-buttons">
            <button
              className={`sort-button ${
                orderBy === "created_at" ? "active" : ""
              }`}
              onClick={() => setOrderBy("created_at")}
            >
              Newest
            </button>
            <button
              className={`sort-button ${orderBy === "upvotes" ? "active" : ""}`}
              onClick={() => setOrderBy("upvotes")}
            >
              Most Popular
            </button>
          </div>
        </div>

        {/* Flag filter dropdown */}
        <div className="flag-filter">
          <span className="filter-label">Filter by:</span>
          <select
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
            className="flag-select"
          >
            <option value="">All Posts</option>
            <option value="Question">Questions</option>
            <option value="Opinion">Opinions</option>
            <option value="News">News</option>
            <option value="Discussion">Discussions</option>
          </select>
        </div>

        {/* Display options toggle */}
        <div className="display-options">
          <label className="show-details-toggle">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => toggleShowDetails(e.target.checked)}
            />
            <span>Show content and images in feed</span>
          </label>
        </div>

        {/* Theme switcher */}
        <div className="theme-switcher">
          <label htmlFor="theme-select" style={{ marginRight: 6 }}>
            Theme:
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => toggleTheme(e.target.value)}
          >
            <option value="blue">Blue</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      {/* Loading animation */}
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post.id} post={post} showDetails={showDetails} />
        ))
      ) : (
        <div className="empty-state">
          <p>No posts found. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
}

export default Home;
