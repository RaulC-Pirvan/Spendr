import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ExpenseList({ refreshKey }) {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadExpenses() {
      try {
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

  return (
    <div style={{ marginTop: "24px" }}>
      <h2>Expenses</h2>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.expenseId}>
                <td>{expense.merchant || "-"}</td>
                <td>{expense.amount || "-"}</td>
                <td>{expense.currency || "-"}</td>
                <td>{expense.category || "-"}</td>
                <td>{expense.status}</td>
                <td>{expense.createdAt?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}