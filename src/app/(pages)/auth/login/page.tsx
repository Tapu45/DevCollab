"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await signIn("credentials", {
      ...form,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setError(res.error);
    else router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-12 flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="emailOrUsername"
          placeholder="Email or Username"
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging In..." : "Log In"}
        </button>
        {error && <div className="text-red-500">{error}</div>}
      </form>
      <div className="my-4 text-center text-gray-500">or log in with</div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="bg-white border rounded px-4 py-2 flex items-center justify-center gap-2"
          onClick={() => signIn("google")}
        >
          <span>Log in with Google</span>
        </button>
        <button
          type="button"
          className="bg-white border rounded px-4 py-2 flex items-center justify-center gap-2"
          onClick={() => signIn("github")}
        >
          <span>Log in with GitHub</span>
        </button>
        <button
          type="button"
          className="bg-white border rounded px-4 py-2 flex items-center justify-center gap-2"
          onClick={() => signIn("linkedin")}
        >
          <span>Log in with LinkedIn</span>
        </button>
        <button
          type="button"
          className="bg-white border rounded px-4 py-2 flex items-center justify-center gap-2"
          onClick={() => signIn("gitlab")}
        >
          <span>Log in with GitLab</span>
        </button>
      </div>
    </div>
  );
}