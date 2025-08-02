import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signInWithGoogle, signOutUser } from '@/lib/firebase';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useToast } from '@/hooks/use-toast';
import { LogIn, LogOut } from 'lucide-react';

export function FirebaseAuth() {
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useFirebaseAuth();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle(true); // Use popup
      toast({
        title: "Success",
        description: "Signed in with Google successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>You're signed in with Firebase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-medium">{user?.displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Firebase Authentication</CardTitle>
        <CardDescription>Sign in with your Google account</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="w-full"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>
      </CardContent>
    </Card>
  );
}