import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";

function RegistrationSuccessPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Registration Successful!
        </h2>
        <p className="text-gray-700">
          Your account has been created. You can now log in.
        </p>
        <Button
          onClick={logout}
          className="cursor-pointer mt-6   px-4 py-2 rounded-md"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export default RegistrationSuccessPage;
