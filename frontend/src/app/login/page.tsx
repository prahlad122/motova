import AuthPageLayout from "@/features/auth/components/AuthPageLayout";
import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Welcome back"
      subtitle="Login to continue to your account"
    >
      <LoginForm />
    </AuthPageLayout>
  );
}