import React from "react";
import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        <motion.div 
          className="absolute inset-0 border-4 border-foreground/10 rounded-full"
        />
        <motion.div 
          className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 bg-primary/20 rounded-full blur-md"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.p 
        className="font-headline-sm text-on-surface-variant animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Loading Component...
      </motion.p>
    </div>
  );
}
