import { Brain } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-gradient-primary rounded-lg p-2">
        <Brain className={`${sizeClasses[size]} text-primary-foreground`} />
      </div>
      <span className={`font-bold ${textSizes[size]} bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent`}>
        RolePlayAI
      </span>
    </div>
  );
};
