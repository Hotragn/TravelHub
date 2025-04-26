import { formatDistanceToNow } from "date-fns";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";

function PostCard({ post, showDetails = false }) {
  const { id, title, created_at, upvotes, content, image_url } = post;
  const formattedDate = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
  });
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`post-card${theme ? ` theme-${theme}` : ""}`}>
      <div className="post-time">Posted {formattedDate}</div>
      <Link to={`/posts/${id}`}>
        <h2 className="post-title">{title}</h2>
      </Link>
      <div className="post-upvotes">{upvotes} upvotes</div>
      {showDetails && (
        <>
          {content && <div className="post-content">{content}</div>}
          {image_url && (
            <img
              src={image_url}
              alt={title}
              className="post-image"
              style={{
                marginTop: "14px",
                maxWidth: "100%",
                borderRadius: "8px",
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default PostCard;
