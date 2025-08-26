"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LeftPanel from "../LeftPanel";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Prefill email from query
  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [searchParams]);

  // Handle OTP input
  const handleOtpChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);

    // Move focus
    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (!value && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("Verifying your email...");
    const res = await fetch("/api/auth/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otp.join("") }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage("Your email has been verified successfully! You can now log in.");
      setUserId(data.userId);
       setTimeout(() => {
        router.push(`/auth/choose-plan?userId=${data.userId}`);
      }, 1800);
    } else {
      setStatus("error");
      setMessage(data.error || "Verification failed.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)] dark:bg-[var(--background)] transition-colors duration-300">
      {/* Left Panel */}
      <div className="w-[25%] min-h-screen">
        <LeftPanel currentStep={1} />
      </div>
      {/* Right Panel */}
      <div className="w-[75%] flex flex-col justify-center items-center px-4 sm:px-8 md:px-16">
        <form
          onSubmit={handleSubmit}
          className="
            flex flex-col gap-5 w-full max-w-md
            bg-gradient-to-br from-[var(--card)] to-[var(--card-foreground)/10]
            text-[var(--card-foreground)]
            border border-[var(--border)]
            shadow-2xl rounded-3xl p-10
            transition-colors duration-300
            backdrop-blur-md
            animate-fade-in
          "
        >
          <div className="flex flex-col items-center mb-2">
            <div className="mb-2">
              {/* Mail/Shield Icon */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-[var(--primary)]">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M17 13v2a3 3 0 01-6 0v-2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-center tracking-tight mb-1">
              Verify your email
            </h2>
            <p className="text-[var(--muted-foreground)] text-base text-center">
              An OTP was sent to <span className="font-semibold text-[var(--primary)]">{email}</span>. Enter it below to continue.
            </p>
          </div>
          <div className="flex flex-row gap-3 justify-center mb-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className={`
                  w-12 h-14 text-2xl text-center font-bold rounded-xl border-2
                  border-[var(--input)] bg-[var(--background)] text-[var(--foreground)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                  shadow transition-all
                  ${digit ? "border-[var(--primary)] bg-[var(--card)]" : ""}
                  ${status === "error" ? "border-[var(--destructive)]" : ""}
                `}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onPaste={handleOtpPaste}
                disabled={status === "success"}
                autoFocus={idx === 0}
                aria-label={`OTP digit ${idx + 1}`}
              />
            ))}
          </div>
          <button
            type="submit"
            className="
              mt-2 py-3 rounded-xl font-semibold text-lg
              bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]
              text-[var(--primary-foreground)]
              hover:from-[var(--accent)] hover:to-[var(--primary)]
              hover:text-[var(--accent-foreground)]
              transition-all shadow-lg
              disabled:opacity-60
            "
            disabled={status === "loading" || otp.some(d => !d)}
          >
            {status === "loading" ? "Verifying..." : "Verify"}
          </button>
          {message && (
            <div className={
              status === "success"
                ? "text-green-600 dark:text-green-400 text-center font-medium"
                : status === "error"
                ? "text-[var(--destructive)] text-center font-medium"
                : "text-center"
            }>
              {message}
            </div>
          )}
        </form>
      </div>
      {/* <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(24px);}
          to { opacity: 1; transform: none;}
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style> */}
    </div>
  );
}