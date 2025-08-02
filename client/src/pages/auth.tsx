import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, registerSchema, type LoginForm, type RegisterForm } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoading(false);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      toast({
        title: "Success!",
        description: "Signed in successfully!",
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast({
        title: "Authentication Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await apiRequest('POST', '/api/auth/register', data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoading(false);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      toast({
        title: "Success!",
        description: "Account created successfully!",
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (data: LoginForm) => {
    setIsLoading(true);
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegisterForm) => {
    setIsLoading(true);
    registerMutation.mutate(data);
  };

  const handleGoogleAuth = () => {
    window.location.href = '/api/login';
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    const texts = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    return texts[strength] || 'Very Weak';
  };

  const getPasswordStrengthColor = (strength: number) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return colors[strength - 1] || 'bg-gray-200';
  };

  const passwordStrength = getPasswordStrength(registerForm.watch('password') || '');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
          <p className="text-gray-600">Secure authentication for your account</p>
        </div>

        {/* Main Auth Card */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Tab Navigation */}
            <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
              <button
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === 'login' 
                    ? "bg-primary text-white shadow" 
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setActiveTab('login')}
              >
                Sign In
              </button>
              <button
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === 'register' 
                    ? "bg-primary text-white shadow" 
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setActiveTab('register')}
              >
                Sign Up
              </button>
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <div>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</Label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="pl-12"
                        {...loginForm.register('email')}
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-12 pr-12"
                        {...loginForm.register('password')}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="mt-2 text-sm text-red-600">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        {...loginForm.register('rememberMe')}
                      />
                      <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                        Remember me
                      </Label>
                    </div>
                    <a href="#" className="text-sm text-primary hover:text-blue-800 transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Google Sign In */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleAuth}
                >
                  <img 
                    src="https://developers.google.com/identity/images/g-logo.png" 
                    alt="Google" 
                    className="w-5 h-5 mr-3" 
                  />
                  Continue with Google
                </Button>
              </div>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <div>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
                  {/* Name Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">First Name</Label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="First name"
                          className="pl-12"
                          {...registerForm.register('firstName')}
                        />
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                      {registerForm.formState.errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {registerForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Last Name</Label>
                      <Input
                        type="text"
                        placeholder="Last name"
                        {...registerForm.register('lastName')}
                      />
                      {registerForm.formState.errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {registerForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</Label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="pl-12"
                        {...registerForm.register('email')}
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-12 pr-12"
                        {...registerForm.register('password')}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {registerForm.watch('password') && (
                      <div className="mt-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                "flex-1 h-1 rounded",
                                level <= passwordStrength
                                  ? getPasswordStrengthColor(level)
                                  : "bg-gray-200"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Password strength: {getPasswordStrengthText(passwordStrength)}
                        </p>
                      </div>
                    )}
                    
                    {registerForm.formState.errors.password && (
                      <p className="mt-2 text-sm text-red-600">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-12 pr-12"
                        {...registerForm.register('confirmPassword')}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      className="mt-1"
                      {...registerForm.register('acceptTerms')}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="#" className="text-primary hover:text-blue-800 transition-colors">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-primary hover:text-blue-800 transition-colors">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  {registerForm.formState.errors.acceptTerms && (
                    <p className="text-sm text-red-600">
                      {registerForm.formState.errors.acceptTerms.message}
                    </p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Google Sign Up */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleAuth}
                >
                  <img 
                    src="https://developers.google.com/identity/images/g-logo.png" 
                    alt="Google" 
                    className="w-5 h-5 mr-3" 
                  />
                  Sign up with Google
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Secure authentication powered by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}
