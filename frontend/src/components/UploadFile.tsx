import { useState } from "react";
import axios from "axios";
import "./UploadFile.css";
import TextField from "@mui/material/TextField";
import { TextareaAutosize } from "@mui/material";

interface UploadResult {
  ipfsHash: string;
  sha256Hash: string;
  pHash: string;
  txId: string;
}

const UploadFile = () => {
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [artist, setArtist] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image || !caption || !artist) {
      alert("Please fill out all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);
    formData.append("artist", artist);

    try {
      setLoading(true);
      const res = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Upload successful!");
      setResult(res.data);

      // Reset fields
      setCaption("");
      setArtist("");
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="upload-form" onSubmit={handleSubmit}>
        <TextField
          type="text"
          placeholder="Artist name or wallet address"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="input-field"
        />

        <TextField
          placeholder="Write a caption..."
          type="textarea"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="input-field"
          multiline
          rows={4}
          maxRows={8}
        />

        <label className="upload-label">
          {preview ? (
            <img src={preview} alt="Preview" className="image-preview" />
          ) : (
            <span>📸 Click to upload an image</span>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} hidden />
        </label>

        <button type="submit" className="upload-button" disabled={loading}>
          {loading ? "Uploading..." : "Post Image"}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <h3>✅ Upload Complete</h3>
          <p><strong>IPFS Hash:</strong> {result.ipfsHash}</p>
          <p><strong>SHA-256:</strong> {result.sha256Hash}</p>
          <p><strong>pHash:</strong> {result.pHash}</p>
          <p><strong>Transaction ID:</strong> {result.txId}</p>
          <a
            href={`https://ipfs.io/ipfs/${result.ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            🌐 View on IPFS
          </a>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
