import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function getOrCreateUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = crypto.randomUUID ? crypto.randomUUID() : "user-" + Date.now();
    localStorage.setItem("userId", userId);
  }
  return userId;
}

function ImageUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(filePath, file);

    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = await supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    onUpload(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span className="upload-status">Uploading...</span>}
    </div>
  );
}

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [flag, setFlag] = useState("Question");
  const [videoUrl, setVideoUrl] = useState("");
  const [repostId, setRepostId] = useState("");
  const [useLocalImage, setUseLocalImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = getOrCreateUserId();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a title for your post.");
      return;
    }
    if (!secretKey.trim()) {
      alert("Please provide a secret key.");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          title,
          content,
          image_url: imageUrl,
          upvotes: 0,
          user_id: userId,
          secret_key: secretKey,
          flag: flag,
          video_url: videoUrl,
          repost_of: repostId ? parseInt(repostId) : null,
        },
      ])
      .select();

    setLoading(false);

    if (error) {
      alert("Error creating post: " + error.message);
    } else {
      navigate(`/posts/${data[0].id}`);
    }
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Create New Post</h2>
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
          <label htmlFor="post-flag">Post Category:</label>
          <select
            id="post-flag"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
          >
            <option value="Question">Question</option>
            <option value="Opinion">Opinion</option>
            <option value="Discussion">Discussion</option>
            <option value="News">News</option>
          </select>
        </div>

        <div className="form-group">
          <label>Image:</label>
          <div className="image-toggle">
            <label>
              <input
                type="radio"
                name="imageSource"
                checked={!useLocalImage}
                onChange={() => setUseLocalImage(false)}
              />
              External URL
            </label>
            <label>
              <input
                type="radio"
                name="imageSource"
                checked={useLocalImage}
                onChange={() => setUseLocalImage(true)}
              />
              Upload From Device
            </label>
          </div>

          {useLocalImage ? (
            <ImageUpload onUpload={setImageUrl} />
          ) : (
            <input
              type="url"
              placeholder="Image URL (Optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          )}
          {imageUrl && (
            <div className="image-preview">
              <p>Preview:</p>
              <img
                src={imageUrl}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "200px" }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <input
            type="url"
            placeholder="YouTube or Video URL (Optional)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            placeholder="Repost Post ID (Optional)"
            value={repostId}
            onChange={(e) => setRepostId(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Secret Key (required to edit/delete)"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required
          />
          <small className="form-helper">
            Remember this key! You'll need it to edit or delete your post.
          </small>
        </div>

        <button type="submit" className="form-button" disabled={loading}>
          {loading ? "Creating Post..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
