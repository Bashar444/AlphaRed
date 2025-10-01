import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe, Users, Briefcase, BookOpen, TrendingUp, Award } from 'lucide-react';
import { authRateLimiter, profileSchema } from '@/lib/security';
import { handleSecureError, logSecurityEvent } from '@/lib/errorHandling';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        username: formData.get('username') as string,
      };

      // Validate input
      const validatedData = signUpSchema.parse(data);

      // Check rate limit
      if (!authRateLimiter.checkLimit(validatedData.email)) {
        const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(validatedData.email) / 60000);
        handleSecureError({ 
          message: `Too many sign-up attempts. Please wait ${remainingTime} minutes before trying again.`,
          type: 'rate_limit_error' 
        }, toast);
        return;
      }

      logSecurityEvent('signup_attempt', { email: validatedData.email });

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
            username: validatedData.username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        logSecurityEvent('signup_failed', { email: validatedData.email, error: error.message });
        handleSecureError(error, toast);
      } else {
        logSecurityEvent('signup_success', { email: validatedData.email });
        toast({
          title: "Welcome to Omnium!",
          description: "Account created successfully! Please check your email for verification.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        handleSecureError(error, toast);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      };

      // Validate input
      const validatedData = signInSchema.parse(data);

      // Check rate limit
      if (!authRateLimiter.checkLimit(validatedData.email)) {
        const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(validatedData.email) / 60000);
        handleSecureError({ 
          message: `Too many login attempts. Please wait ${remainingTime} minutes before trying again.`,
          type: 'rate_limit_error' 
        }, toast);
        return;
      }

      logSecurityEvent('signin_attempt', { email: validatedData.email });

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        logSecurityEvent('signin_failed', { email: validatedData.email, error: error.message });
        handleSecureError(error, toast);
      } else {
        logSecurityEvent('signin_success', { email: validatedData.email });
        router.push('/');
        toast({
          title: "Welcome back to Omnium!",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        handleSecureError(error, toast);
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Users, title: "Professional Network", desc: "Connect with industry professionals worldwide" },
    { icon: Briefcase, title: "Career Opportunities", desc: "Discover jobs, freelance work, and business ventures" },
    { icon: BookOpen, title: "Continuous Learning", desc: "Access courses, webinars, and skill assessments" },
    { icon: TrendingUp, title: "Business Growth", desc: "Analytics, insights, and growth tools" },
    { icon: Award, title: "Recognition", desc: "Showcase achievements and earn certifications" },
    { icon: Globe, title: "Global Community", desc: "Join a worldwide ecosystem of professionals" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left side - Branding and Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-lg">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-4xl font-bold text-white">Omnium</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6">
            Your Complete Professional Ecosystem
          </h1>
          <p className="text-xl text-blue-100 mb-12">
            Join millions of professionals in the ultimate platform for networking, learning, career growth, and business success.
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4 lg:hidden">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Omnium
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Join Omnium Today</CardTitle>
            <CardDescription>
              Connect, Learn, and Grow in the Ultimate Professional Platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Join Omnium</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      maxLength={128}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In to Omnium
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        required
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        required
                        maxLength={50}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="johndoe"
                      required
                      minLength={3}
                      maxLength={30}
                      pattern="[a-zA-Z0-9_-]+"
                      title="Username can only contain letters, numbers, hyphens, and underscores"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      required
                      minLength={8}
                      maxLength={128}
                      title="Password must contain at least 8 characters with uppercase, lowercase, and number"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Join Omnium
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
