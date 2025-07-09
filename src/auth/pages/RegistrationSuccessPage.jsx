import React, { useEffect } from "react";
import { useMultiStepForm } from "../context/MultiStepFormContext";
import { Link } from "react-router-dom";

function RegistrationSuccessPage() {
  //const { resetForm } = useMultiStepForm();

  // useEffect(() => {
  //   // ⭐ CRITICAL: Call resetForm() here when the success page mounts
  //   // This ensures that the multi-step form data is cleared ONLY after
  //   // successful navigation to the final success page.
  //   console.log(
  //     "RegistrationSuccessPage: Called resetForm to clear multi-step data."
  //   );
  //   resetForm();
  // }, [resetForm]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Registration Successful!
        </h2>
        <p className="text-gray-700">
          Your account has been created. You can now log in.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default RegistrationSuccessPage;
