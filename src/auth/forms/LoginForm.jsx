import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validation";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircleIcon, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
// ⭐ Import Appwrite services
import { account } from "../../lib/appwrite";
// ⭐ Import useAuth from your AuthContext
import { useAuth } from "../context/AuthContext";

console.log("LoginForm: 'account' object after import:", account);

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  // ⭐ Get the login function from AuthContext and rename it to avoid conflict
  const { login: authLogin } = useAuth();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ⭐ Implement the onSubmit function for login
  async function onSubmit(values) {
    setIsLoading(true); // Start loading
    console.log("Attempting login with:", values.email);

    try {
      // ⭐ Appwrite login: Corrected method name to createEmailPasswordSession
      // ⭐ Capture the response which contains the session and user ID
      const session = await account.createEmailPasswordSession(
        values.email,
        values.password
      );

      console.log("Login successful for:", values.email);
      toast.success("Login Successful!", {
        description: "You have been successfully logged in.",
        style: {
          background: "hsl(142.1 76.2% 36.3%)",
          color: "hsl(0 0% 98%)",
          fontWeight: "bold",
        },
      });

      // ⭐ Call the login function from AuthContext, passing the user ID from the session
      await authLogin(session.userId); // Pass the user ID to update AuthContext

      // ⭐ Removed direct navigate('/home') here. AuthRedirector will handle it.
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please check your credentials.";

      if (error.code === 401) {
        // Unauthorized
        errorMessage = "Invalid email or password. Please try again.";
      } else if (
        error.code === 400 &&
        error.message.includes("User is not verified")
      ) {
        errorMessage =
          "Your email is not verified. Please check your inbox for the verification link.";
      } else if (
        error.code === 409 &&
        error.message.includes(
          "Creation of a session is prohibited when a session is active."
        )
      ) {
        errorMessage = "You are already logged in. Redirecting to homepage.";
        // If a session is already active, we can still try to trigger the AuthContext login
        // to ensure the state is consistent, then navigate to home.
        // We don't have the userId from a new session here, so we'll rely on AuthContext's internal get()
        await authLogin(); // Call without arguments, AuthContext will fetch current user
        navigate("/home", { replace: true });
      }
      // You can add more specific error handling based on Appwrite error codes/messages

      toast.error("Login Failed", {
        description: errorMessage,
        style: {
          background: "hsl(0 84.2% 60.2%)",
          color: "hsl(0 0% 98%)",
          fontWeight: "bold",
        },
      });
      // Set a form-level error if needed
      form.setError("root.serverError", {
        message: errorMessage,
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  }

  return (
    <Form {...form} className="">
      <Card>
        <CardHeader className="flex flex-col items-center text-center">
          <UserCircle2 size={58} strokeWidth={1.5} />
          <CardTitle className="md:text-2xl text-xl">
            Log in to your account
          </CardTitle>
          <CardDescription>Enter your details to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 w-full"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      placeholder="Enter your email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ⭐ Password Field with Toggle */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"} // ⭐ Dynamically set type
                        placeholder="Enter your password"
                        className="shad-input pr-10" // Added pr-10 for padding for the icon
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)} // ⭐ Toggle showPassword state
                      disabled={isLoading}
                    >
                      <span className="cursor-pointer">
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" /> // ⭐ Show EyeOff when password is visible
                        ) : (
                          <Eye className="h-4 w-4" /> // ⭐ Show Eye when password is hidden
                        )}
                      </span>
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="shad-button cursor-pointer">
              {isLoading ? (
                <div className="flex flex-center gap-2">
                  <LoaderCircleIcon className="animate-spin size-5" />
                </div>
              ) : (
                "Login"
              )}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="underline underline-offset-4">
                Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
}

export default LoginForm;
