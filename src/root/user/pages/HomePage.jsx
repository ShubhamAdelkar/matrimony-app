import { useAuth } from "@/auth/context/AuthContext";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const { logout } = useAuth();
  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4">
          <div className="min-h-screen flex items-center justify-center flex-1">
            <div className="text-center p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-4">Log In Successful!</h2>
              <p className="">Hello there!!!</p>
              <Button
                onClick={logout}
                className="cursor-pointer mt-6   px-4 py-2 rounded-md"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
