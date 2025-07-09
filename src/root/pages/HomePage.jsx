import { useAuth } from "@/auth/context/AuthContext";

const HomePage = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 flex-1">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Registration Successful!
        </h2>
        <p className="text-gray-700">
          Your account has been created. You can now log in.
        </p>
        <button
          onClick={logout}
          className="cursor-pointer mt-6 bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default HomePage;
