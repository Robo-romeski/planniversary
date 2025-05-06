"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    profile_picture_url: ""
  });
  const [preferences, setPreferences] = useState<any>(null);
  const [prefForm, setPrefForm] = useState({
    default_location: "",
    budget_preference: "medium",
    custom_budget_min: "",
    custom_budget_max: "",
    theme_preference: "",
    notification_preference: "email",
    email_notifications: true,
    sms_notifications: false
  });
  const [prefLoading, setPrefLoading] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefError, setPrefError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3001/api/users/profile", {
          credentials: "include"
        });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          username: data.username || "",
          profile_picture_url: data.profile_picture_url || ""
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPreferences = async () => {
      setPrefLoading(true);
      try {
        const res = await fetch("http://localhost:3001/api/users/preferences", {
          credentials: "include"
        });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch preferences");
        const data = await res.json();
        setPreferences(data);
        setPrefForm({
          default_location: data.default_location || "",
          budget_preference: data.budget_preference || "medium",
          custom_budget_min: data.custom_budget_min || "",
          custom_budget_max: data.custom_budget_max || "",
          theme_preference: data.theme_preference || "",
          notification_preference: data.notification_preference || "email",
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? false
        });
      } catch (e: any) {
        setPrefError(e.message);
      } finally {
        setPrefLoading(false);
      }
    };
    fetchPreferences();
  }, [router]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setProfile(data);
      alert("Profile updated!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/user/profile", {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete account");
      alert("Account deleted");
      router.push("/login");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost:3001/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: "" }) // If required, pass the refresh token
    });
    router.push("/login");
  };

  const handlePrefChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setPrefForm((f: any) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePrefSave = async (e: any) => {
    e.preventDefault();
    setPrefSaving(true);
    setPrefError("");
    try {
      const res = await fetch("http://localhost:3001/api/users/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prefForm)
      });
      if (!res.ok) throw new Error("Failed to update preferences");
      const data = await res.json();
      setPreferences(data);
      alert("Preferences updated!");
    } catch (e: any) {
      setPrefError(e.message);
    } finally {
      setPrefSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-medium">First Name</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block font-medium">Last Name</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="border p-2 w-full" type="email" />
        </div>
        <div>
          <label className="block font-medium">Username</label>
          <input name="username" value={form.username} onChange={handleChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block font-medium">Profile Picture</label>
          {form.profile_picture_url && (
            <img src={form.profile_picture_url} alt="Profile" className="w-24 h-24 rounded-full mb-2" />
          )}
          {/* TODO: Add upload button and logic */}
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
      <button onClick={handleDelete} className="mt-6 bg-red-600 text-white px-4 py-2 rounded" disabled={deleting}>
        {deleting ? "Deleting..." : "Delete Account"}
      </button>
      <button onClick={handleLogout} className="mt-4 bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300">Logout</button>
      <h2 className="text-xl font-bold mt-8 mb-2">Preferences</h2>
      {prefLoading ? (
        <div>Loading preferences...</div>
      ) : prefError ? (
        <div className="text-red-500">{prefError}</div>
      ) : (
        <form onSubmit={handlePrefSave} className="space-y-4">
          <div>
            <label className="block font-medium">Default Location</label>
            <input name="default_location" value={prefForm.default_location} onChange={handlePrefChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium">Budget Preference</label>
            <select name="budget_preference" value={prefForm.budget_preference} onChange={handlePrefChange} className="border p-2 w-full">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {prefForm.budget_preference === "custom" && (
            <div className="flex gap-2">
              <input name="custom_budget_min" value={prefForm.custom_budget_min} onChange={handlePrefChange} className="border p-2 w-1/2" placeholder="Min" type="number" />
              <input name="custom_budget_max" value={prefForm.custom_budget_max} onChange={handlePrefChange} className="border p-2 w-1/2" placeholder="Max" type="number" />
            </div>
          )}
          <div>
            <label className="block font-medium">Theme Preference</label>
            <input name="theme_preference" value={prefForm.theme_preference} onChange={handlePrefChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium">Notification Preference</label>
            <select name="notification_preference" value={prefForm.notification_preference} onChange={handlePrefChange} className="border p-2 w-full">
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="email_notifications" checked={prefForm.email_notifications} onChange={handlePrefChange} /> Email Notifications
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="sms_notifications" checked={prefForm.sms_notifications} onChange={handlePrefChange} /> SMS Notifications
            </label>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={prefSaving}>
            {prefSaving ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      )}
    </div>
  );
} 