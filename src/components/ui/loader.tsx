import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "dots" | "pulse" | "spin";
  className?: string;
  text?: string;
}

export function Loader({
  size = "md",
  variant = "default",
  className,
  text
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>
        {text && <span className="ml-3 text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn("rounded-full bg-primary animate-pulse", sizeClasses[size])}></div>
        {text && <span className="ml-3 text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === "spin") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn("border-4 border-muted border-t-primary rounded-full animate-spin", sizeClasses[size])}></div>
        {text && <span className="ml-3 text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 rounded-full border-4 border-muted animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
      </div>
      {text && <span className="ml-3 text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Site-wide loading screen component
export function SiteLoader({ isLoading = true }: { isLoading?: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6">
        {/* Simple logo */}
        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">CC</span>
        </div>

        {/* Simple loading indicator */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}
