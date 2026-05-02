import { motion } from "motion/react";
import { Icon } from "@iconify/react";

const EmptyRideState = () => {
  return (
    <motion.div
      className="text-center py-12 bg-white rounded-lg shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, 0, -10, 0] }}
        transition={{
          scale: { duration: 0.5 },
          rotate: { delay: 0.5, duration: 1.5 },
        }}
      >
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
          <Icon icon="mdi:car-outline" className="text-yellow-400 text-5xl" />
        </div>
      </motion.div>

      <motion.h3
        className="text-2xl font-bold text-gray-800 mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        You're the Pioneer!
      </motion.h3>

      <motion.p
        className="text-gray-600 max-w-md mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Looks like you're the first one on this way. Create your own ride and
        let others hop along!
      </motion.p>

      <motion.div
        className="mt-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <motion.div
          className="inline-block"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            y: { duration: 1.5, repeat: Infinity },
          }}
        >
          <Icon
            icon="mdi:arrow-down-bold"
            className="text-yellow-400 text-3xl"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EmptyRideState;
