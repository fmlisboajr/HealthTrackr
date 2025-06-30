import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <Card 
      className={cn("glass-effect border-0 shadow-xl animate-fade-in", className)} 
      {...props}
    >
      {children}
    </Card>
  );
}
