import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Chrome, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GoogleAuthDemo = () => {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState('signin');

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      const isSignUpMode = currentTab === 'signup';
      const result = await signInWithGoogle(isSignUpMode);
      
      if (result.success) {
        // The new tab will handle the authentication flow
        // Notifications are handled in the useAuth hook
      } else {
        toast({
          title: "Authentication Failed",
          description: result.error?.message || 'Failed to initiate Google authentication',
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-center text-xl">Google Authentication Demo</CardTitle>
          <CardDescription className="text-center">
            Experience tab-based Google authentication with smart notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click the button below to sign in with your Google account
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Signing in...' : 'Sign in with Google'}
                </Button>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  A new tab will open for Google authentication
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click the button below to create a new account with Google
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Signing up...' : 'Sign up with Google'}
                </Button>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  A new tab will open for Google account creation
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Features:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>New tab-based authentication (no popup blockers)</li>
              <li>Smart notifications based on action (sign-in vs sign-up)</li>
              <li>Automatic user detection (new vs returning)</li>
              <li>Proper error handling and user feedback</li>
              <li>Loading states during authentication</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleAuthDemo;
