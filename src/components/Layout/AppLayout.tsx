"use client";

import React from "react";
import Sidebar from "./SIdebar";
import Navbar from "./Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main column: navbar + content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Navbar with rounded top-left corner */}
        <div className="relative">
          <Navbar />
          {/* Rounded corner overlay */}
          <div className="absolute top-0 left-0 w-6 h-6 bg-white dark:bg-gray-900 rounded-tl-2xl -ml-6 z-10" />
        </div>

        <main
          className="flex-1 overflow-auto p-6"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.00), rgba(0,0,0,0.02))",
          }}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}