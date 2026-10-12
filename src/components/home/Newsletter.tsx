
import { useState } from "react";
import { Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmail("");
      toast({
        title: "Thank you for subscribing!",
        description: "You'll now receive our latest property updates and market insights.",
      });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50">
      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Left column with image */}
        <div 
          className="md:col-span-2 bg-cover bg-center h-48 md:h-auto min-h-[220px]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop')" }}
        ></div>
        
        {/* Right column with form */}
        <div className="md:col-span-3 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center mb-2">
            <Mail className="h-5 w-5 text-accent mr-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent">NEWSLETTER</h3>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3 text-foreground">
            Stay Updated with Campus Comfort
          </h2>
          
          <p className="text-muted-foreground text-sm md:text-base mb-6">
            Subscribe to receive the latest student accommodations, verified lodges, and campus living tips directly in your inbox.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your student or personal email"
                className="flex-grow px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-colors font-medium flex items-center justify-center shrink-0 shadow-sm"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              We respect your privacy. No spam, unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
