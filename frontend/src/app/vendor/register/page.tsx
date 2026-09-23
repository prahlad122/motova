import AuthPageLayout from "@/features/auth/components/AuthPageLayout";
import VendorRegisterForm from "@/features/auth/components/VendorRegisterForm";

export default function VendorRegistrationPage() {
  return (
    <AuthPageLayout
      title="Create Your Account!"
      subtitle="Enter your details below to create your vendor account"
    >
      <VendorRegisterForm />
    </AuthPageLayout>
  );
}
