
import { Helmet } from "react-helmet-async";
import AuthForm from "@/components/auth/AuthForm";

export default function UserLogin() {
  return (
    <>
      <Helmet>
        <title>User Login | Campus Comfort</title>
      </Helmet>

      <AuthForm
        mode="login"
        userType="user"
        title="Welcome back"
        description="Enter your credentials to access your user account"
        redirectPath="/user-login"
      />
    </>
  );
}
