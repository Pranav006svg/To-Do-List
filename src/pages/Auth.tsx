import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: { full_name: fullName } },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created! You can now sign in.");
      setIsLogin(true);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Hero / Illustration */}
        <section className="px-6 md:px-12">
          <div className="max-w-md mx-auto text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              Focus on what matters.
            </h1>
            <p className="mt-4 text-slate-600">
              Smart, simple task management to help you organize your work and ship more.
            </p>

            <ul className="mt-6 space-y-3 text-left">
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white">✓</span>
                <span className="text-slate-700">Fast, focused task creation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500 text-white">✓</span>
                <span className="text-slate-700">Team-ready with per-user data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-rose-500 text-white">✓</span>
                <span className="text-slate-700">Clean UI that scales to mobile</span>
              </li>
            </ul>

            <div className="mt-8">
              {/* Simple decorative illustration (SVG) */}
              <div className="mx-auto md:mx-0 w-full max-w-sm">
                <svg viewBox="0 0 600 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" fill="none">
                  <rect x="10" y="50" width="580" height="300" rx="18" fill="#eef2ff" />
                  <circle cx="80" cy="160" r="8" fill="#6366f1" />
                  <rect x="110" y="140" width="380" height="24" rx="6" fill="#c7d2fe" />
                  <rect x="110" y="180" width="300" height="18" rx="6" fill="#e0e7ff" />
                  <rect x="110" y="210" width="220" height="18" rx="6" fill="#e9efff" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Auth card */}
        <section className="px-6 md:px-12">
          <div className="max-w-md mx-auto">
            <Card className="p-6 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">{isLogin ? "Sign in" : "Create account"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <Label htmlFor="fullName">Full name</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading} style={{ background: "var(--gradient-primary)" }}>
                    {loading ? "Working..." : isLogin ? "Sign in" : "Create account"}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-slate-600 hover:text-slate-900">
                    {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                  </button>
                </div>
              </CardContent>
            </Card>
            <p className="mt-4 text-center text-xs text-slate-500">By continuing, you agree to our terms and privacy policy.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Auth;
