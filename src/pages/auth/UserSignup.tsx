
import { Helmet } from "react-helmet-async";
import AuthForm from "@/components/auth/AuthForm";

export default function UserSignup() {
  return (
    <>
      <Helmet>
        <title>User Sign Up | Tonys Estate</title>
      </Helmet>

      <AuthForm
        mode="signup"
        userType="user"
        title="Create a user account"
        description="Enter your information to create your Tonys Estate student account"
        redirectPath="/user-login"
      />
    </>
  );
}
