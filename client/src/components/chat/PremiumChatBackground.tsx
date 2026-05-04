import { motion } from "motion/react";

const PremiumChatBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-slate-50" />
      
      {/* Animated Blobs */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-200/30 rounded-full blur-[100px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-[40%] -right-[10%] w-[35%] h-[35%] bg-amber-200/20 rounded-full blur-[80px]"
        animate={{
          x: [0, -40, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-[5%] left-[20%] w-[30%] h-[30%] bg-orange-100/40 rounded-full blur-[90px]"
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />
    </div>
  );
};

export default PremiumChatBackground;
