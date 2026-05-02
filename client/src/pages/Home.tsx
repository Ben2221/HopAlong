import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Welcome to My Web Page</h1>
      <p>This is a basic description of my web page.</p>
      <Link to="/about">Learn more about us</Link>
    </motion.div>
  );
}
