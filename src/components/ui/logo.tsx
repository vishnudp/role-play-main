import { Brain } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-[75%] h-auto",
    md: "w-[65%] h-auto",
    lg: "w-[50%] h-auto"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* <div className="bg-gradient-primary rounded-lg p-2">
        <Brain className={`${sizeClasses[size]} text-primary-foreground`} />
      </div>
      <span className={`font-bold ${textSizes[size]} bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent`}>
        RolePlayAI
      </span> */}
      <img src="/logo.png" alt="RolePlayAI Logo" className={`${sizeClasses[size]} rounded-md`} />
    </div>
  );
};
