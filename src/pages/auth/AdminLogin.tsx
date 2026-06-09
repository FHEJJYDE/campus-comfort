
import { Helmet } from "react-helmet-async";
import AuthForm from "@/components/auth/AuthForm";

export default function AdminLogin() {
  return (
    <>
      <Helmet>
        <title>Admin Login | Tonys Estate</title>
      </Helmet>

      <AuthForm
        mode="login"
        userType="admin"
        title="Admin Portal"
        description="Enter your credentials to access the admin dashboard"
        redirectPath="/admin-login"
      />
    </>
  );
}
