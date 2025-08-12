// src/auth/pages/LoginPage.jsx
import LoginForm from "../forms/LoginForm"; // Your LoginForm component
import { useNavigate } from "react-router-dom";
// import { createEmailPasswordSession } from '../../lib/appwrite/client'; // Your Appwrite login function

function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSubmit = async (values) => {
    console.log("Login submitted from dedicated page:", values);
    try {
      // Replace with your actual Appwrite login logic
      // await createEmailPasswordSession(values.email, values.password);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log("Login successful!");
      alert("Login successful! Redirecting...");
      navigate("/dashboard"); // Redirect to dashboard or appropriate authenticated route
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed: " + error.message); // Show error to user
    }
  };

  return <LoginForm onSubmit={handleLoginSubmit} />;
}

export default LoginPage;
