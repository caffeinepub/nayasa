import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useCustomerAuth } from "../hooks/useCustomerAuth";

type Step = "choose" | "phone" | "otp" | "signing-up";

export function Signup() {
  const { login, isLoggedIn } = useCustomerAuth();
  const navigate = useNavigate();
  const { actor } = useActor();

  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState("");
  const [socialLoading, setSocialLoading] = useState<
    "google" | "outlook" | null
  >(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoggedIn) navigate({ to: "/" });
  }, [isLoggedIn, navigate]);

  const startOtpTimer = () => {
    setOtpTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSocialSignUp = async (provider: "google" | "outlook") => {
    setSocialLoading(provider);
    setStep("signing-up");
    await new Promise((r) => setTimeout(r, 1500));
    const u = {
      name: provider === "google" ? "Google User" : "Outlook User",
      email: provider === "google" ? "user@gmail.com" : "user@outlook.com",
      phone: "",
    };
    if (actor) {
      try {
        await (actor as any).registerUser(u.name, u.phone, u.email, "buyer");
      } catch (_) {}
    }
    login(u);
    setSocialLoading(null);
    navigate({ to: "/profile-setup" });
  };

  const handleSendOtp = () => {
    if (phone.length < 10) return;
    setStep("otp");
    startOtpTimer();
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }
    setOtpError("");
    const u = {
      name: `User ${phone.slice(-4)}`,
      email: "",
      phone: `+91${phone}`,
    };
    if (actor) {
      try {
        await (actor as any).registerUser(u.name, u.phone, u.email, "buyer");
      } catch (_) {}
    }
    login(u);
    navigate({ to: "/profile-setup" });
  };

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/3 blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, oklch(0.88 0.17 168) 39px, oklch(0.88 0.17 168) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, oklch(0.88 0.17 168) 39px, oklch(0.88 0.17 168) 40px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-display font-black text-3xl text-primary mint-text-glow">
              Re
            </span>
            <span className="font-display font-black text-3xl text-foreground">
              Genix
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            The phone isn't just 'used,' it's 'regenerated.'
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 card-glow">
          <AnimatePresence mode="wait">
            {step === "signing-up" && (
              <motion.div
                key="signing-up"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 py-8"
              >
                <div className="relative w-16 h-16">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">
                    {socialLoading === "google" ? "G" : "M"}
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    Creating your account...
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connecting to{" "}
                    {socialLoading === "google" ? "Google" : "Microsoft"}
                  </p>
                </div>
              </motion.div>
            )}

            {step === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="font-display font-black text-2xl text-foreground">
                    Create your account
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Join India's most trusted phone marketplace
                  </p>
                </div>

                {/* Google Sign Up */}
                <button
                  type="button"
                  data-ocid="signup.google.button"
                  onClick={() => handleSocialSignUp("google")}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                    aria-label="Google"
                    role="img"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  Sign up with Google
                </button>

                {/* Outlook / Microsoft Sign Up */}
                <button
                  type="button"
                  data-ocid="signup.outlook.button"
                  onClick={() => handleSocialSignUp("outlook")}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 21 21"
                    aria-label="Microsoft"
                    role="img"
                  >
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                  </svg>
                  Sign up with Outlook
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Phone option */}
                <button
                  type="button"
                  data-ocid="signup.phone.button"
                  onClick={() => setStep("phone")}
                  className="w-full flex items-center justify-center gap-3 border border-border bg-secondary text-foreground font-semibold py-3.5 rounded-xl hover:border-primary/50 transition-colors"
                >
                  <span className="text-lg">📱</span>
                  Sign up with Phone
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  By signing up, you agree to ReGenix's Terms of Service and
                  Privacy Policy
                </p>
              </motion.div>
            )}

            {step === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    data-ocid="signup.phone.back_button"
                    onClick={() => setStep("choose")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ←
                  </button>
                  <div>
                    <h1 className="font-display font-black text-2xl text-foreground">
                      Your Number
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      We'll send a 6-digit OTP to verify
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Mobile Number
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-secondary border border-border rounded-lg text-sm font-semibold text-foreground">
                      🇮🇳 +91
                    </div>
                    <Input
                      data-ocid="signup.phone.input"
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className="flex-1 bg-secondary border-border text-foreground"
                      maxLength={10}
                    />
                  </div>
                </div>

                <Button
                  data-ocid="signup.send_otp.button"
                  onClick={handleSendOtp}
                  disabled={phone.length < 10}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90"
                >
                  Send OTP
                </Button>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    data-ocid="signup.otp.back_button"
                    onClick={() => setStep("phone")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ←
                  </button>
                  <div>
                    <h1 className="font-display font-black text-2xl text-foreground">
                      Verify OTP
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Sent to +91 {phone}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={`otp-pos-${index + 1}`}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      data-ocid={`signup.otp.input.${index + 1}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-secondary border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                {otpError && (
                  <p
                    data-ocid="signup.otp.error_state"
                    className="text-destructive text-sm text-center"
                  >
                    {otpError}
                  </p>
                )}

                <div className="text-center text-sm">
                  {otpTimer > 0 ? (
                    <span className="text-muted-foreground">
                      Resend OTP in{" "}
                      <span className="text-primary font-mono">
                        {otpTimer}s
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      data-ocid="signup.otp.resend_button"
                      onClick={() => {
                        setOtp(["", "", "", "", "", ""]);
                        startOtpTimer();
                      }}
                      className="text-primary underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <Button
                  data-ocid="signup.otp.submit_button"
                  onClick={handleVerifyOtp}
                  disabled={otp.join("").length < 6}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90"
                >
                  Verify & Create Account
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            data-ocid="signup.login.link"
            className="text-primary underline underline-offset-2"
          >
            Log in
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Secured by ICP blockchain end-to-end encryption
        </p>
      </motion.div>
    </div>
  );
}
