import { useState } from "react";
import UploadReceipt from "./components/UploadReceipt";
import ExpenseList from "./components/ExpenseList";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Spendr</h1>
      <p>Upload receipts and track your expenses.</p>

      <UploadReceipt onUploaded={() => setRefreshKey((key) => key + 1)} />
      <ExpenseList refreshKey={refreshKey} />
    </main>
  );
}

export default App;