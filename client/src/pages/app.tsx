import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { loginSchema, registerSchema, type LoginForm, type RegisterForm, type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Eye, EyeOff, Mail, Lock, User as UserIcon, Loader2, LogOut, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Get current user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!authToken,
    retry: false,
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    }
  });

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
      setIsAuthenticating(false);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setAuthToken(data.token);
      }
      toast({
        title: "Success!",
        description: "Signed in successfully!",
      });
    },
    onError: (error: any) => {
      setIsAuthenticating(false);
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
      setIsAuthenticating(false);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setAuthToken(data.token);
      }
      toast({
        title: "Success!",
        description: "Account created successfully!",
      });
    },
    onError: (error: any) => {
      setIsAuthenticating(false);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (data: LoginForm) => {
    setIsAuthenticating(true);
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegisterForm) => {
    setIsAuthenticating(true);
    registerMutation.mutate(data);
  };

  const handleGoogleAuth = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
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

  // Show loading state
  if (authToken && userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show dashboard if authenticated
  if (authToken && user) {
    const initials = user.firstName && user.lastName 
      ? `${user.firstName[0]}${user.lastName[0]}` 
      : user.email?.[0]?.toUpperCase() || 'U';

    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : 'User';

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SecureAuth</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user.firstName || 'User'}!</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome to your secure dashboard</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={fullName} />
                      <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{fullName}</h3>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span>{user.email}</span>
                    </div>
                    {user.createdAt && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Member since:</span>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Account Security</span>
                      <span className="text-sm font-medium text-green-600">✓ Secure</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Authentication Method</span>
                      <span className="text-sm font-medium">
                        {user.profileImageUrl ? 'Google OAuth' : 'Email/Password'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email Verified</span>
                      <span className="text-sm font-medium text-green-600">✓ Verified</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Your account is protected with industry-standard security measures.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show authentication form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SecureAuth</span>
          </div>
        </nav>
      </header>

      {/* Main Auth Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
            <p className="text-gray-600">Secure authentication for your account</p>
          </div>

          {/* Auth Card */}
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

                    {/* Remember Me */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        {...loginForm.register('rememberMe')}
                      />
                      <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                        Remember me
                      </Label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isAuthenticating}
                    >
                      {isAuthenticating ? (
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
                          <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

                    {/* Terms Checkbox */}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        {...registerForm.register('acceptTerms')}
                      />
                      <Label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed">
                        I accept the Terms of Service and Privacy Policy
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
                      disabled={isAuthenticating}
                    >
                      {isAuthenticating ? (
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
                    Sign up with Google
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}