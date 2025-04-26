import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader"; // You need to create this component
import { supabase } from "../supabaseClient";

function PostPage() {
  const [post, setPost] = useState(null);
  const [repostedPost, setRepostedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [secretKey, setSecretKey] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'edit', 'delete', or null
  const { id } = useParams();
  const navigate = useNavigate();

  // Get or create user ID from localStorage
  const userId = getUserId();

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  // Function to get/create a user ID
  function getUserId() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      // Create a unique ID using crypto API if available or fallback to timestamp
      userId = crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`;
      localStorage.setItem("userId", userId);
    }
    return userId;
  }

  // Helper function to convert video URLs to embed format
  function getEmbedUrl(url) {
    if (!url) return null;

    try {
      // YouTube
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.includes("v=")
          ? url.split("v=")[1].split("&")[0]
          : url.split("youtu.be/")[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      // Add more video platforms as needed
      return url; // Return original if no conversion needed
    } catch (e) {
      console.error("Error parsing video URL:", e);
      return url;
    }
  }

  async function fetchPost() {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      navigate("/");
    } else {
      setPost(data);
      setIsOwner(data.user_id === userId);

      // If this post is a repost, fetch the original
      if (data.repost_of) {
        fetchRepostedPost(data.repost_of);
      }
    }

    setLoading(false);
  }

  async function fetchRepostedPost(repostId) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", repostId)
      .single();

    if (error) {
      console.error("Error fetching reposted post:", error);
    } else {
      setRepostedPost(data);
    }
  }

  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
  }

  async function handleUpvote() {
    if (!post) return;

    const newUpvotes = (post.upvotes || 0) + 1;

    const { error } = await supabase
      .from("posts")
      .update({ upvotes: newUpvotes })
      .eq("id", id);

    if (error) {
      console.error("Error upvoting post:", error);
    } else {
      setPost({ ...post, upvotes: newUpvotes });
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();

    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: id,
          content: newComment,
          user_id: userId, // Associate comment with current user
        },
      ])
      .select();

    if (error) {
      console.error("Error adding comment:", error);
    } else {
      setComments([...comments, data[0]]);
      setNewComment("");
    }
  }

  async function handleEditClick() {
    if (isOwner) {
      // If user is confirmed owner, go directly to edit page
      navigate(`/posts/${id}/edit`);
    } else {
      // Otherwise prompt for secret key
      setActionType("edit");
      setShowSecretKeyModal(true);
    }
  }

  async function handleDeleteClick() {
    if (isOwner) {
      // If user is confirmed owner, delete directly after confirmation
      confirmDelete();
    } else {
      // Otherwise prompt for secret key
      setActionType("delete");
      setShowSecretKeyModal(true);
    }
  }

  async function confirmDelete() {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) {
        console.error("Error deleting post:", error);
      } else {
        navigate("/");
      }
    }
  }

  async function verifySecretKey() {
    // Check if the provided secret key matches the one stored with the post
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("secret_key", secretKey)
      .single();

    if (error || !data) {
      alert(
        "Invalid secret key. You are not authorized to perform this action."
      );
      return false;
    }

    return true;
  }

  async function handleSecretKeySubmit(e) {
    e.preventDefault();

    if (await verifySecretKey()) {
      setShowSecretKeyModal(false);

      if (actionType === "edit") {
        navigate(`/posts/${id}/edit`);
      } else if (actionType === "delete") {
        confirmDelete();
      }
    }

    // Clear the secret key field
    setSecretKey("");
  }

  if (loading) {
    return <Loader />; // Replace with your loader component
  }

  if (!post) {
    return <p>Post not found</p>;
  }

  return (
    <div className="post-detail">
      <div className="post-time">
        Posted{" "}
        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
      </div>

      {post.user_id && (
        <div className="post-author">
          Posted by:{" "}
          {post.user_id === userId
            ? "You"
            : `User ${post.user_id.slice(0, 8)}...`}
        </div>
      )}

      {/* Display post flag/category if it exists */}
      {post.flag && (
        <div className="post-flag">
          <span className={`flag-${post.flag.toLowerCase()}`}>{post.flag}</span>
        </div>
      )}

      <h1>{post.title}</h1>

      {post.content && <div className="post-content">{post.content}</div>}

      {post.image_url && (
        <img src={post.image_url} alt={post.title} className="post-image" />
      )}

      {/* Display embedded video if video_url exists */}
      {post.video_url && (
        <div className="post-video">
          <iframe
            width="560"
            height="315"
            src={getEmbedUrl(post.video_url)}
            title="Embedded video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Display the reposted content if this is a repost */}
      {repostedPost && (
        <div className="repost-reference">
          <h3>Repost of:</h3>
          <Link to={`/posts/${repostedPost.id}`} className="repost-title">
            {repostedPost.title}
          </Link>
          {repostedPost.content && (
            <div className="repost-content">{repostedPost.content}</div>
          )}
          {repostedPost.image_url && (
            <img
              src={repostedPost.image_url}
              alt={repostedPost.title}
              className="repost-image"
            />
          )}
        </div>
      )}

      <div className="post-actions">
        <button className="upvote-button" onClick={handleUpvote}>
          👍 <span className="upvote-count">{post.upvotes}</span>
        </button>

        <button className="edit-button" onClick={handleEditClick}>
          ✏️ Edit
        </button>

        <button className="delete-button" onClick={handleDeleteClick}>
          🗑️ Delete
        </button>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>

        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              {comment.user_id && (
                <div className="comment-author">
                  {comment.user_id === userId
                    ? "You"
                    : `User ${comment.user_id.slice(0, 8)}...`}
                  :
                </div>
              )}
              <p>{comment.content}</p>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        <form className="comment-form" onSubmit={handleAddComment}>
          <input
            type="text"
            placeholder="Leave a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" className="comment-submit">
            Post Comment
          </button>
        </form>
      </div>

      {/* Secret Key Modal */}
      {showSecretKeyModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Authentication Required</h3>
            <p>You need to enter the secret key to {actionType} this post.</p>
            <form onSubmit={handleSecretKeySubmit}>
              <input
                type="password"
                placeholder="Enter secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowSecretKeyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostPage;
