import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ExpenseList({ refreshKey }) {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadExpenses() {
      try {
        setError("");
        const res = await fetch(`${API_URL}/expenses?userId=test-user`);
        const data = await res.json();

        if (!ignore) {
          setExpenses(data.expenses || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      }
    }

    loadExpenses();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const summary = useMemo(() => {
    const processed = expenses.filter((expense) => expense.status === "PROCESSED");
    const total = processed.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    return {
      total,
      count: expenses.length,
      processed: processed.length,
    };
  }, [expenses]);

  return (
    <div className="expenses-stack">
      <div className="summary-grid">
        <SummaryCard label="Total tracked" value={`${summary.total.toFixed(2)} RON`} />
        <SummaryCard label="Receipts" value={summary.count} />
        <SummaryCard label="Processed" value={summary.processed} />
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <p className="section-label">Expense history</p>
            <h2>Recent receipts</h2>
          </div>
          <span className="badge">DynamoDB</span>
        </div>

        {error && <div className="alert error">Error: {error}</div>}

        {expenses.length === 0 ? (
          <div className="empty-state">
            <h3>No expenses yet</h3>
            <p>Upload your first receipt to populate this dashboard.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.expenseId}>
                    <td>
                      <div className="merchant-cell">
                        <span className="merchant-icon">
                          {(expense.merchant || "?").slice(0, 1)}
                        </span>
                        <span>{expense.merchant || "Pending OCR"}</span>
                      </div>
                    </td>
                    <td>
                      {expense.amount ? `${Number(expense.amount).toFixed(2)} ${expense.currency || ""}` : "-"}
                    </td>
                    <td>{expense.category || "-"}</td>
                    <td>
                      <span className={`status-badge ${expense.status?.toLowerCase()}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td>{expense.createdAt?.slice(0, 10) || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="summary-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}