"use client";

import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/services/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();

  return (
    <AuthForm
      mode="register"
      onSubmit={({ name, email, password }) => register(name, email, password)}
    />
  );
}
