"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("http://localhost:3001/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: "" })
    });
    router.push("/login");
  };
  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
    >
      Logout
    </button>
  );
} 