// frontend/src/components/CustomerList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // 1. Fetch data from backend
    axios
      .get("http://localhost:4000/customers")
      .then((response) => {
        setCustomers(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Customer Database</h2>
      <table
        border="1"
        cellPadding="10"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
            <th>Phone</th>
            <th>Name</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.phone}</td>
              <td>{c.name || "Unknown"}</td>
              <td>{new Date(c.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
