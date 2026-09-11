"use client";

import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/services/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <AuthForm
      mode="login"
      onSubmit={({ email, password }) => login(email, password)}
    />
  );
}
