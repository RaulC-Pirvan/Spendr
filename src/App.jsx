import { useState } from "react";
import UploadReceipt from "./components/UploadReceipt";
import ExpenseList from "./components/ExpenseList";
import "./App.css";

function App({ signOut, user }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">AWS Cloud Expense Tracker</p>
          <h1>Spendr</h1>
          <p className="subtitle">
            Upload receipts, process them in the cloud, and track your expenses.
          </p>
          <p className="user-line">
            Signed in as <strong>{user?.signInDetails?.loginId || "user"}</strong>
          </p>
        </div>

        <div className="topbar-actions">
          <div className="status-pill">
            <span className="status-dot" />
            Live AWS Demo
          </div>

          <button className="ghost-button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="left-column">
          <UploadReceipt onUploaded={() => setRefreshKey((key) => key + 1)} />
        </section>

        <section className="right-column">
          <ExpenseList refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  );
}

export default App;