import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

// Auth related imports
import AuthLayout from "./auth/AuthLayout";
import AuthRedirector from "./auth/pages/AuthRedirector";
import MainRegistrationLayout from "./auth/MainRegistrationLayout";
import LoginPage from "./auth/pages/LoginPage";
import RegisterPage from "./auth/pages/RegisterPage"; //
import { MultiStepFormProvider } from "./auth/context/MultiStepFormContext";
import EmailVerificationCallback from "./auth/forms/EmailVerificationCallback";

// Root/Authenticated related imports
import RootLayout from "./root/RootLayout";
import RegistrationSuccessPage from "./auth/pages/RegistrationSuccessPage";
import { AuthProvider } from "./auth/context/AuthContext";
import HomePage from "./root/user/pages/HomePage";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <MultiStepFormProvider>
          <AuthProvider>
            <Toaster position="top-center" richColors />

            {/* ⭐ Wrap your entire application with AuthProvider */}
            <Routes>
              <Route path="/" element={<AuthRedirector />} />

              {/* Public Routes using AuthLayout */}
              {/* ⭐ CORRECTED: BOTH /login and /register are now nested under AuthLayout */}
              <Route
                element={
                  <MultiStepFormProvider>
                    <AuthLayout />
                  </MultiStepFormProvider>
                }
              >
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Subsequent Steps: /onboarding (requires MainRegistrationLayout for visuals AND MultiStepFormProvider for context) */}
              <Route
                path="/onboarding"
                element={
                  <MultiStepFormProvider>
                    {/* ENSURE THIS PROVIDER IS HERE */}
                    <MainRegistrationLayout />
                  </MultiStepFormProvider>
                }
              />

              {/* EMAIL VERIFICATION CALLBACK */}
              <Route
                path="/verify-email-callback"
                element={
                  <MultiStepFormProvider>
                    <EmailVerificationCallback />
                  </MultiStepFormProvider>
                }
              />

              {/* Private Routes */}
              <Route
                element={
                  <MultiStepFormProvider>
                    <RootLayout />
                  </MultiStepFormProvider>
                }
              >
                <Route path="/home" element={<HomePage />} />
                <Route
                  path="/registration-success"
                  element={<RegistrationSuccessPage />}
                />
              </Route>

              {/* ⭐ Catch-all route for unmatched paths (e.g., 404 page or redirect to home/login) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </MultiStepFormProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
