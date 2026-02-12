"use client";

import { useState } from "react";

export default function LoginPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
      });

      if (!res.ok) {
        setError("Failed to send link. Try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A magic link will be sent to your admin email.
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-muted rounded-md text-sm">
            Check your email for a login link. It expires in 15 minutes.
          </div>
        ) : (
          <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {loading ? "Sending..." : "Send Login Link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
