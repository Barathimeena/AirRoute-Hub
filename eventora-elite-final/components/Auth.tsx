
import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

interface AuthProps {
  // role parameter will be provided as part of login (admins auto-detected by name)
  onLogin: (name: string, country: string, currency: 'INR' | 'USD', role?: 'ADMIN' | 'FREELANCER' | 'RECRUITER') => void;
}

// Simple CAPTCHA generator
const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;
  return { question: `${num1} + ${num2}`, answer: answer.toString() };
};

const COUNTRIES = [
  { name: 'India', code: 'IN', currency: 'INR' as const, flag: '🇮🇳' },
  { name: 'United States', code: 'US', currency: 'USD' as const, flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'UK', currency: 'USD' as const, flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', currency: 'USD' as const, flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', currency: 'USD' as const, flag: '🇦🇺' },
  { name: 'Dubai/UAE', code: 'AE', currency: 'USD' as const, flag: '🇦🇪' },
  { name: 'Singapore', code: 'SG', currency: 'USD' as const, flag: '🇸🇬' },
  { name: 'Germany', code: 'DE', currency: 'USD' as const, flag: '🇩🇪' },
];

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [roleChoice, setRoleChoice] = useState<'ADMIN' | 'PASSENGER' | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'country'>('login');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '',
    password: '',
    otp: '',
    captchaAnswer: '',
    country: '',
    currency: 'USD' as const
  });
  const isAdmin = roleChoice === 'ADMIN';
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [errors, setErrors] = useState<string[]>([]);

  const validatePassword = (pass: string) => {
    const rules = [];
    if (pass.length < 8) rules.push("Minimum 8 characters");
    if (!/[A-Z]/.test(pass)) rules.push("One uppercase letter");
    if (!/[0-9]/.test(pass)) rules.push("One numeric digit");
    return rules;
  };

  useEffect(() => {
    if (formData.password && mode === 'signup') setErrors(validatePassword(formData.password));
    else setErrors([]);
  }, [formData.password, mode]);

  const handleSignupInit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      // simple admin signup without OTP/captcha/country
      notificationService.saveUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: '',
        currency: 'USD',
        role: 'ADMIN'
      });
      alert('Admin account created. Please login.');
      setMode('login');
      return;
    }

    if (formData.captchaAnswer !== captcha.answer) {
      setErrors(['Incorrect CAPTCHA answer']);
      setCaptcha(generateCaptcha());
      return;
    }
    if (errors.length === 0 && formData.name && formData.email) {
      // send OTP to provided email (or demo fallback)
      notificationService.sendOtpEmail(formData.email).then(() => {
        setMode('otp');
      });
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (notificationService.verifyOtp(formData.email, formData.otp)) {
      // persist user so login can work
      const role = formData.name.toLowerCase().includes('admin') ? 'ADMIN' : 'FREELANCER';
      notificationService.saveUser({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        country: formData.country,
        currency: formData.currency,
        role
      });
      alert('Signup complete. Please login using your email and password.');
      setFormData({ name: '', email: '', password: '', otp: '', captchaAnswer: '', country: '', currency: 'USD' });
      setMode('login');
    } else {
      alert('Invalid or expired OTP code.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.password) {
      const user = notificationService.findUserByName(formData.name);
      if (user && user.password === formData.password) {
        // use explicit choice if set, otherwise fall back to stored or inferred
        const roleFromUser = (user as any).role as 'ADMIN' | 'FREELANCER' | 'RECRUITER' | undefined;
        const chosen = roleChoice === 'ADMIN' ? 'ADMIN' : undefined;
        const inferredRole = chosen || roleFromUser || (formData.name.toLowerCase().includes('admin') ? 'ADMIN' : 'FREELANCER');
        onLogin(user.name, user.country || 'IN', user.currency || 'INR', inferredRole);
      } else {
        alert('Invalid credentials or user not registered.');
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#020617] overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto text-white shadow-2xl shadow-blue-500/40 mb-6">
              <span className="text-4xl font-black">E</span>
            </div>
            {roleChoice === null ? (
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Select Role</h2>
          ) : (
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
              {mode === 'login' ? 'Terminal Login' : 'New Account'}
            </h2>
          )}
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              Elite Aviation Gateway
            </p>
          </div>

          {roleChoice === null ? (
            <div className="flex flex-col gap-4 mb-8">
              <button onClick={() => { setRoleChoice('PASSENGER'); setMode('login'); }} className="w-full py-4 bg-blue-600 rounded-xl text-white font-black">I'm a Passenger</button>
              <button onClick={() => { setRoleChoice('ADMIN'); setMode('login'); }} className="w-full py-4 bg-red-600 rounded-xl text-white font-black">I'm an Admin</button>
            </div>
          ) : mode !== 'otp' && mode !== 'country' && (
            <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/5">
              <button 
                onClick={() => setMode('login')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setMode(isAdmin ? 'signup' : 'country')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                <input required className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Access Key</label>
                <input required type="password" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <button className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-blue-500 transition-all">
                Enter Terminal
              </button>
            </form>
          )}

          {!isAdmin && mode === 'country' && (
            <div className="space-y-6">
              <p className="text-center text-sm text-slate-300 font-bold">Select your country to set pricing currency</p>
              <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto">
                {COUNTRIES.map(country => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      setFormData({...formData, country: country.name, currency: country.currency});
                      setMode('signup');
                    }}
                    className="p-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-blue-600/30 hover:border-blue-500 transition-all flex flex-col items-center gap-2"
                  >
                    <span className="text-4xl">{country.flag}</span>
                    <span className="text-xs font-bold text-white">{country.name}</span>
                    <span className="text-[10px] text-slate-400">{country.currency}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignupInit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                <input required className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              {!isAdmin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email</label>
                  <input required type="email" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              )}
              {!isAdmin && (
                <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/30">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">📍 Selected Location</p>
                  <p className="text-sm font-bold text-white">{formData.country || 'Please select a country'} ({formData.currency})</p>
                  <button type="button" onClick={() => setMode('country')} className="mt-2 text-[10px] text-blue-400 font-bold hover:underline">Change Country</button>
                </div>
              )}
              {!isAdmin && (
                <>  
                  {/* CAPTCHA Verification */}
                  <div className="p-4 bg-blue-600/10 rounded-xl border border-blue-500/20">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">🤖 Human Verification Required</p>
                    <p className="text-sm font-bold text-white mb-3">{captcha.question} = ?</p>
                    <input 
                      required 
                      type="text" 
                      inputMode="numeric"
                      maxLength={2}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none text-center" 
                      placeholder="Answer" 
                      value={formData.captchaAnswer}
                      onChange={e => {
                        setFormData({...formData, captchaAnswer: e.target.value});
                        setErrors([]); // Clear error when user types
                      }} 
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Create Password</label>
                <input required type="password" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              {errors.length > 0 && (
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  {errors.map(err => <p key={err} className="text-[10px] text-red-400 font-black uppercase tracking-widest">• {err}</p>)}
                </div>
              )}
              <button 
                disabled={errors.length > 0 || (!formData.country && !isAdmin)} 
                className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] disabled:opacity-20"
              >
                {isAdmin ? 'Create Account' : 'Send OTP Code'}
              </button>
              <button type="button" onClick={() => setMode('country')} className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest">← Back to Country</button>
            </form>
          )}

          {!isAdmin && mode === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-6">
              <p className="text-center text-xs text-slate-400 font-medium px-4">A 4-digit security code has been sent to your email address.</p>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Enter Code</label>
                <input required maxLength={4} className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-4xl tracking-[0.5em] text-center outline-none" placeholder="0000" value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
              </div>
              <button className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em]">
                Verify & Initialize
              </button>
              <button type="button" onClick={() => setMode('signup')} className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Back</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
