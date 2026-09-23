import AuthPageLayout from "@/features/auth/components/AuthPageLayout";
import AdminLoginForm from "@/features/auth/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <AuthPageLayout
      title="Welcome back!"
      subtitle="Sign in to manage your Motova account"
    >
      <AdminLoginForm />
    </AuthPageLayout>
  );
}
