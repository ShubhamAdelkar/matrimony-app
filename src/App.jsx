// src/App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

// Auth related imports
import AuthLayout from "./auth/AuthLayout"; // Your existing AuthLayout
import LoginPage from "./auth/pages/LoginPage"; // New wrapper for LoginForm
import RegisterPage from "./auth/pages/RegisterPage"; // New wrapper for RegisterForm (Step 1)

// Multi-step specific imports for steps 2+
import { MultiStepFormProvider } from "./auth/context/MultiStepFormContext";
import MainRegistrationLayout from "./auth/MainRegistrationLayout"; // New orchestrator for steps 2+

// Root/Authenticated related imports
import RootLayout from "./root/RootLayout";
import RegistrationSuccessPage from "./auth/pages/RegistrationSuccessPage";
import { AuthProvider, useAuth } from "./auth/context/AuthContext";
import HomePage from "./root/pages/HomePage";

// Optional: A simple success page
// const RegistrationSuccessPage = () => (
//   <div className="min-h-screen flex items-center justify-center bg-green-50">
//     <div className="text-center p-8 bg-white rounded-lg shadow-lg">
//       <h2 className="text-3xl font-bold text-green-600 mb-4">
//         Registration Successful!
//       </h2>
//       <p className="text-gray-700">
//         Your account has been created. You can now log in.
//       </p>
//       <Link
//         to="/login"
//         className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
//       >
//         Go to Login
//       </Link>
//     </div>
//   </div>
// );

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ⭐ Wrap your entire application with AuthProvider */}
        <Routes>
          {/* Public Routes using AuthLayout */}
          {/* ⭐ CORRECTED: BOTH /login and /register are now nested under AuthLayout */}
          <Route
            element={
              // MultiStepFormProvider wrapped here to ensure it's available for RegisterPage and potentially for LoginPage if context is used there too.
              // If LoginPage doesn't need it, you can move MultiStepFormProvider inside the /register route's element.
              <MultiStepFormProvider>
                <AuthLayout />
              </MultiStepFormProvider>
            }
          >
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />{" "}
            {/* This is Step 1 */}
          </Route>

          {/* Subsequent Steps: /onboarding (requires MainRegistrationLayout for visuals AND MultiStepFormProvider for context) */}
          {/* Note: MultiStepFormProvider is already provided by the parent AuthLayout route now, but keeping it here
            is fine if MainRegistrationLayout needs a fresh context or if you want to be explicit.
            However, it's generally better to provide context at the highest common ancestor.
            Since /register and /onboarding both use the MultiStepFormProvider, putting it
            around AuthLayout (as above) makes sense.
        */}
          <Route
            path="/onboarding"
            element={
              <MultiStepFormProvider>
                {/* ENSURE THIS PROVIDER IS HERE */}
                <MainRegistrationLayout />
              </MultiStepFormProvider>
            }
          />

          {/* Registration Success Page */}
          <Route
            path="/registration-success"
            element={
              <MultiStepFormProvider>
                {/* Keep provider here if success page needs it, or remove if it doesn't */}
                <RegistrationSuccessPage />
              </MultiStepFormProvider>
            }
          />

          {/* Private Routes */}
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            {/* <Route path="/dashboard" element={<Home />} /> */}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
