"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/me", { method: "GET", credentials: "include" });
        console.log("respones start");
        console.log(res);
        const data = res.json();
        console.log("respones end");
        if (res.ok) {
          console.log(data.email)
          console.log("already logged pushing to dashborad")
          localStorage.setItem("userEmail", data.email)
          await router.push("/dashboard"); // already logged in

        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("userEmail", email);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("tenant", data.user.tenant);
      // no need to save token, cookie is auto-managed
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center  text-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-72 p-6 border border-gray-300 rounded-xl shadow-md bg-white"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 border  border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="mt-2 px-4 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
        >
          Login
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>

  );
}
