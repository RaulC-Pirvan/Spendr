import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function UploadReceipt({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a receipt first.");
      return;
    }

    try {
      setStatus("Requesting upload URL...");

      const uploadRes = await fetch(`${API_URL}/receipts/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "image/jpeg",
          userId: "test-user"
        })
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.message || "Failed to get upload URL");
      }

      setStatus("Uploading receipt to S3...");

      const s3Res = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "image/jpeg"
        },
        body: file
      });

      if (!s3Res.ok) {
        throw new Error("Failed to upload file to S3");
      }

      setStatus("Processing receipt...");

      const processRes = await fetch(`${API_URL}/receipts/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: "test-user",
          expenseId: uploadData.expenseId
        })
      });

      const processData = await processRes.json();

      if (!processRes.ok) {
        throw new Error(processData.message || "Failed to process receipt");
      }

      setResult(processData.expense);
      setStatus("Receipt processed successfully.");

      if (onUploaded) onUploaded();

    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", borderRadius: "8px" }}>
      <h2>Upload receipt</h2>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} style={{ marginLeft: "12px" }}>
        Upload
      </button>

      {status && <p>{status}</p>}

      {result && (
        <div>
          <h3>Processed expense</h3>
          <p><strong>Merchant:</strong> {result.merchant}</p>
          <p><strong>Amount:</strong> {result.amount} {result.currency}</p>
          <p><strong>Category:</strong> {result.category}</p>
          <p><strong>Status:</strong> {result.status}</p>
        </div>
      )}
    </div>
  );
}