import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const GetStartedButton = () => {
  const navigate = useNavigate();
  return (
    <motion.button
      className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={() => {
        void navigate("/dashboard");
      }}
    >
      Get Started
      <Icon icon="line-md:chevron-right" />
    </motion.button>
  );
};

export default GetStartedButton;
