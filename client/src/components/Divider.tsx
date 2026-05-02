// components/Divider.jsx
import { motion } from "motion/react";

interface DividerProps {
  text?: string;
  delay?: number;
}

const Divider = ({ text, delay = 0 }: DividerProps) => {
  return (
    <motion.div
      className="relative my-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        {text && <span className="px-4 bg-white text-gray-500">{text}</span>}
      </div>
    </motion.div>
  );
};

export default Divider;
