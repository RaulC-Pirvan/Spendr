import { useRef, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = import.meta.env.VITE_API_URL;

export default function UploadReceipt({ onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);

  const getToken = async () => {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a receipt first.");
      return;
    }

    try {
      setIsUploading(true);
      setResult(null);
      setStatus("Requesting secure upload URL...");

      const token = await getToken();

      const uploadRes = await fetch(`${API_URL}/receipts/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "image/jpeg",
        }),
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.message || "Failed to get upload URL");
      }

      setStatus("Uploading receipt to S3...");

      const s3Res = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "image/jpeg",
        },
        body: file,
      });

      if (!s3Res.ok) {
        throw new Error("Failed to upload file to S3");
      }

      setStatus("Processing receipt...");

      const processRes = await fetch(`${API_URL}/receipts/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expenseId: uploadData.expenseId,
          s3Key: uploadData.s3Key,
        }),
      });

      const processData = await processRes.json();

      if (!processRes.ok) {
        throw new Error(processData.message || "Failed to process receipt");
      }

      setResult(processData.expense);
      setStatus("Receipt processed successfully.");
      setFile(null);

      if (inputRef.current) inputRef.current.value = "";
      if (onUploaded) onUploaded();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card upload-card">
      <div className="card-header">
        <div>
          <p className="section-label">Receipt upload</p>
          <h2>Add a new expense</h2>
        </div>
        <span className="badge">S3 + Lambda</span>
      </div>

      <div className="dropzone" onClick={() => inputRef.current?.click()}>
        <div className="upload-icon">↑</div>
        <h3>{file ? file.name : "Choose a receipt"}</h3>
        <p>
          Upload a JPG, PNG or PDF receipt. Spendr will store it in S3 and
          process it through AWS.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <button className="primary-button" onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Processing..." : "Upload receipt"}
      </button>

      {status && (
        <div className={status.startsWith("Error") ? "alert error" : "alert"}>
          {status}
        </div>
      )}

      {result && (
        <div className="result-card">
          <p className="section-label">Latest processed expense</p>
          <div className="result-row">
            <span>Merchant</span>
            <strong>{result.merchant || "-"}</strong>
          </div>
          <div className="result-row">
            <span>Amount</span>
            <strong>
              {result.amount} {result.currency || ""}
            </strong>
          </div>
          <div className="result-row">
            <span>Category</span>
            <strong>{result.category || "-"}</strong>
          </div>
        </div>
      )}
    </div>
  );
}