import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome back to Growmoji</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to continue building your habits with emojis
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border-0",
            }
          }}
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
} 