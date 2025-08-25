import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from '@/components/Navbar';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />
      <div className="pt-20 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          {/* Company Branding with Home Icon */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted/50 rounded-full"
              onClick={() => window.location.href = '/'}
              title="Go to Home"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Building2 className="w-4 h-4" />
            <span className="font-medium">ZeroXTech | Chaitanya</span>
          </div>
          
          {/* 404 Content */}
          <div className="space-y-4">
            <h1 className="text-8xl font-bold text-gradient">404</h1>
            <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
            <p className="text-muted-foreground">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Link>
            </Button>
            <Button asChild className="flex items-center gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Return Home
              </Link>
            </Button>
          </div>
          
          {/* Additional Info */}
          <div className="text-xs text-muted-foreground pt-4 border-t border-border/30">
            <p>If you believe this is an error, please contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
