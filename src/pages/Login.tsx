import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export function Login() {
    const navigate = useNavigate();
    const { login, loginWithGoogle, verifying, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            navigate("/admin");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="font-sans bg-warm-white text-charcoal min-h-screen flex flex-col md:flex-row overflow-hidden selection:bg-yellow-500 selection:text-white">
            <div className="relative hidden md:flex w-full md:w-1/2 lg:w-[55%] h-screen flex-col justify-end p-16 bg-stone-100">
                <div className="absolute inset-4 z-0 overflow-hidden">
                    <div className="w-full h-full bg-cover bg-center grayscale-[20%] sepia-[10%] transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCG59wrLNs7JaHsB2e56tc7ZJNLjM9SfofAoHeim-85J4nhfWYfdmRopsRoL-qIgqD-Rom8cp2zFpvaVzTiqJkRULcGOMgRTzvT7l5mSvBRatwW3pod0CxwufkM2ibWor-wn771ivGTTDuu0erSSLb0X2f7Y3y377XD2O3hCPL2TUL1WGWwBj8N2LfS6KsHN6Nr-UCgB835W0a6RewjEXqoBGQYUZ7De4CsA1VCX5mOPuzAZgmM07-gpW1QPQpw0k6VMmACjnlbd1I')" }}>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 border-[1px] border-white/20 m-4 pointer-events-none"></div>
                </div>
                <div className="relative z-10 max-w-xl mb-6 ml-6">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="material-symbols-outlined text-3xl text-white font-light">school</span>
                        <span className="text-sm font-sans tracking-[0.2em] text-white/90 uppercase border-b border-white/30 pb-1">Est. 2014</span>
                    </div>
                    <h2 className="font-serif text-5xl lg:text-6xl text-white mb-6 leading-tight italic">
                        "Preserving the moments that shaped us."
                    </h2>
                    <p className="font-sans text-white/80 font-light leading-relaxed max-w-md text-base tracking-wide">
                        A digital archive for the Class of '14. Reconnect with old friends and relive the golden days in a space designed for memory.
                    </p>
                </div>
            </div>
            <div className="w-full md:w-1/2 lg:w-[45%] h-screen flex flex-col justify-center items-center p-8 bg-warm-white relative">
                <div className="absolute top-8 right-8 hidden md:block">
                    <div className="h-16 w-[1px] bg-charcoal/10 mx-auto mb-2"></div>
                    <span className="text-[10px] uppercase tracking-widest text-charcoal/40 vertical-rl">Login V.02</span>
                </div>
                <div className="w-full max-w-sm space-y-12">
                    <div className="text-center space-y-4">
                        <div className="md:hidden flex justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-charcoal">school</span>
                        </div>
                        <p className="text-xs font-sans font-medium tracking-[0.2em] text-[#D4AF37] uppercase">The Archives</p>
                        <h1 className="font-serif text-4xl lg:text-5xl text-charcoal tracking-tight">Legacy Core</h1>
                        <div className="w-12 h-[1px] bg-charcoal mx-auto mt-6 mb-8"></div>
                        <h2 className="text-lg font-sans font-light text-charcoal/80">Welcome Back to the Core</h2>
                    </div>
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                                <p className="font-medium">Authentication Error</p>
                                <p className="text-red-600/80">{error}</p>
                            </div>
                        )}
                        <div className="group relative">
                            <input
                                autoComplete="email"
                                className="block w-full border-0 border-b border-stone-200 bg-transparent py-3 text-charcoal placeholder-charcoal/30 focus:border-charcoal focus:ring-0 sm:text-sm transition-all duration-300 outline-none"
                                id="email"
                                name="email"
                                placeholder="Email Address"
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="group relative">
                            <input
                                autoComplete="current-password"
                                className="block w-full border-0 border-b border-stone-200 bg-transparent py-3 text-charcoal placeholder-charcoal/30 focus:border-charcoal focus:ring-0 sm:text-sm transition-all duration-300 outline-none"
                                id="password"
                                name="password"
                                placeholder="Password"
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="absolute right-0 top-3">
                                <a className="text-xs font-medium text-charcoal/40 hover:text-charcoal transition-colors uppercase tracking-wider" href="#">Forgot?</a>
                            </div>
                        </div>
                        <div className="pt-4 space-y-6">
                            <button
                                className="w-full bg-charcoal text-white font-sans text-xs uppercase tracking-[0.15em] py-4 px-4 hover:bg-charcoal/90 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={verifying}
                            >
                                {verifying ? "Verifying..." : "Enter Archives"}
                            </button>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input className="h-3 w-3 text-charcoal focus:ring-charcoal/20 border-charcoal/20 rounded-sm bg-transparent" id="remember-me" name="remember-me" type="checkbox" />
                                    <label className="ml-2 block text-xs text-charcoal/60 font-light" htmlFor="remember-me">
                                        Remember me
                                    </label>
                                </div>
                                <p className="text-xs text-charcoal/60 font-light">
                                    New here?
                                    <a className="font-medium text-charcoal hover:underline decoration-1 underline-offset-4 ml-1" href="#">Request Access</a>
                                </p>
                            </div>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-stone-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-warm-white px-2 text-charcoal/40 tracking-widest">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={loading || verifying ? undefined : loginWithGoogle}
                        disabled={loading || verifying}
                        className="w-full bg-white border border-stone-200 text-charcoal font-sans text-xs uppercase tracking-[0.15em] py-4 px-4 hover:bg-stone-50 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z"
                                fill="#EA4335"
                            />
                        </svg>
                        School ID (Google)
                    </button>

                    <div className="pt-8 flex justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-300">
                        <a aria-label="Help" className="text-charcoal hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-xs uppercase tracking-wide" href="#">
                            Help
                        </a>
                        <span className="text-charcoal/20">|</span>
                        <a aria-label="Privacy" className="text-charcoal hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-xs uppercase tracking-wide" href="#">
                            Privacy
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
}
