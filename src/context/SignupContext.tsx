"use client";
import React, { createContext, useContext, useState } from "react";

type SignupContextType = {
  email: string;
  password: string;
  setSignupCredentials: (email: string, password: string) => void;
  clearSignupCredentials: () => void;
};

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setSignupCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  const clearSignupCredentials = () => {
    setEmail("");
    setPassword("");
  };

  return (
    <SignupContext.Provider
      value={{ email, password, setSignupCredentials, clearSignupCredentials }}
    >
      {children}
    </SignupContext.Provider>
  );
}

export function useSignupContext() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error("useSignupContext must be used within SignupProvider");
  return ctx;
}