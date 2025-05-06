"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    username: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        console.log('Signup error response:', data);
        throw new Error(data.error || "Failed to register");
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="border p-2 w-full" required />
        </div>
        <div>
          <label className="block font-medium">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="border p-2 w-full" required minLength={8} />
        </div>
        <div>
          <label className="block font-medium">First Name</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} className="border p-2 w-full" required minLength={2} />
        </div>
        <div>
          <label className="block font-medium">Last Name</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} className="border p-2 w-full" required minLength={2} />
        </div>
        <div>
          <label className="block font-medium">Username</label>
          <input name="username" value={form.username} onChange={handleChange} className="border p-2 w-full" required minLength={3} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">Registration successful! Redirecting to login...</div>}
      </form>
      <div className="mt-4 text-center">
        Already have an account? <a href="/login" className="text-blue-600 underline">Log in</a>
      </div>
    </div>
  );
} 