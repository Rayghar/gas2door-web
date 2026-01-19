"use client";
import React from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { GlassCard } from "@/components/ui/Glass";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { useAuth } from "@/state/auth";
import { ArrowRight, Chrome, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { setSession } = useAuth();
  // Changed state name to 'email' to match backend expectation
  const [email, setEmail] = React.useState(""); 
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true); 
    setError(null);
    
    try {
      // ✅ FIX: Send 'email' key instead of 'identifier' to match Backend Joi Schema
      const res: any = await api.post(endpoints.auth.login, { 
        email: email, 
        password: password 
      });

      const token = res?.accessToken || res?.token || res?.data?.accessToken;
      const user = res?.user || res?.data?.user;
      
      if (!token) throw new Error("Login succeeded but no token returned.");
      
      setSession({ accessToken: token, user });
      window.location.href = "/dashboard";
      
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogleLogin = () => {
    alert("Google Login requires the OAuth SDK. Please integrate frontend library.");
  };

  return (
    <div>
      <TopNav />
      <main className="mx-auto max-w-lg px-4 pt-24 pb-24">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-slate-400">Sign in to your account</p>
          </div>

          <div className="space-y-4">
            {/* Updated placeholder since backend currently only validates emails */}
            <Input 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <Input 
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200 flex items-center gap-2 justify-center">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="mt-6">
            <Button className="w-full h-12 text-base font-bold bg-gas-teal text-gas-navy hover:bg-white" onClick={onSubmit} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm text-gas-teal hover:underline">Forgot Password?</Link>
          </div>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Or</div>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <div className="grid gap-3">
            <Button variant="outline" className="w-full h-12 border-white/10 hover:bg-white/5 text-white" onClick={handleGoogleLogin}>
              <Chrome className="mr-2 h-5 w-5" /> Sign in with Google
            </Button>
            
            <Link href="/order/new">
                <Button variant="ghost" className="w-full h-12 text-gas-teal hover:bg-gas-teal/10">
                Continue as Guest <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </div>

          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account? <Link className="font-bold text-white hover:text-gas-teal transition-colors" href="/signup">Sign Up</Link>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}