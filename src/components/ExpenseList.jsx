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
    const processed = expenses.filter((e) => e.status === "PROCESSED");
    const total = processed.reduce((sum, e) => sum + Number(e.amount || 0), 0);

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
            <p>Upload your first receipt.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="table-wrap desktop-only">
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
                      <td>{expense.merchant || "Pending OCR"}</td>
                      <td>
                        {expense.amount
                          ? `${Number(expense.amount).toFixed(2)} ${expense.currency || ""}`
                          : "-"}
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

            {/* MOBILE CARDS */}
            <div className="mobile-cards">
              {expenses.map((expense) => (
                <div key={expense.expenseId} className="expense-card">
                  <div className="expense-top">
                    <strong>{expense.merchant || "Pending OCR"}</strong>
                    <span className={`status-badge ${expense.status?.toLowerCase()}`}>
                      {expense.status}
                    </span>
                  </div>

                  <div className="expense-row">
                    <span>Amount</span>
                    <strong>
                      {expense.amount
                        ? `${Number(expense.amount).toFixed(2)} ${expense.currency || ""}`
                        : "-"}
                    </strong>
                  </div>

                  <div className="expense-row">
                    <span>Category</span>
                    <strong>{expense.category || "-"}</strong>
                  </div>

                  <div className="expense-row">
                    <span>Date</span>
                    <strong>{expense.createdAt?.slice(0, 10) || "-"}</strong>
                  </div>
                </div>
              ))}
            </div>
          </>
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