import { LoginForm } from "@/components/dashboard/LoginForm";

export const metadata = {
  title: "Connexion — OpineoDJ",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Opineo<span className="text-accent">DJ</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">by BlyAnalytics</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
