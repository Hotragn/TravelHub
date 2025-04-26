// In EditPost.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function EditPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id]);

  async function fetchPost() {
    const { data, error } = await supabase
      .from("posts")
      .select("title, content, image_url")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      navigate("/");
    } else {
      setTitle(data.title || "");
      setContent(data.content || "");
      setImageUrl(data.image_url || "");
    }

    setLoading(false);
  }

  async function verifySecretKey() {
    if (!secretKey.trim()) {
      alert("Please enter the secret key");
      return;
    }

    //const encodedKey = btoa(secretKey); // Use the same encoding method as in CreatePost

    const { data, error } = await supabase
      .from("posts")
      .select("id")
      .eq("id", id)
      .eq("secret_key", secretKey)
      .single();

    if (error || !data) {
      alert("Invalid secret key. You are not authorized to edit this post.");
    } else {
      setIsVerified(true);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isVerified) {
      verifySecretKey();
      return;
    }

    if (!title.trim()) {
      alert("Please provide a title for your post.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        image_url: imageUrl,
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      alert("Error updating post: " + error.message);
    } else {
      navigate(`/posts/${id}`);
    }
  }

  if (loading) {
    return <p>Loading post...</p>;
  }

  return (
    <div className="form-container">
      <h2>Update Post</h2>

      {!isVerified ? (
        <div>
          <p>
            Please enter the secret key to verify you are the author of this
            post.
          </p>
          <div className="form-group">
            <input
              type="password"
              placeholder="Secret Key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>
          <button onClick={verifySecretKey} className="form-button">
            Verify Key
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <textarea
              placeholder="Content (Optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              type="url"
              placeholder="Image URL (Optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "Updating Post..." : "Update Post"}
          </button>
        </form>
      )}
    </div>
  );
}

export default EditPost;
