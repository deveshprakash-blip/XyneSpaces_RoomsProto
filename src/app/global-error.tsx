"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 400,
              width: "100%",
              background: "white",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb",
              padding: 32,
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111", marginBottom: 8 }}>
              Something went wrong
            </h1>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
              {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{
                  padding: "8px 16px",
                  background: "#2563eb",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 500,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d1d5db",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
