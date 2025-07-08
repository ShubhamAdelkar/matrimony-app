// src/auth/pages/RegisterPage.jsx
import React from "react";
import AuthLayout from "../AuthLayout"; // Import AuthLayout
import RegisterForm from "../forms/RegisterForm"; // Your RegisterForm component

function RegisterPage() {
  // RegisterForm will handle its own submission and navigation to /onboarding
  return <RegisterForm />;
}

export default RegisterPage;
