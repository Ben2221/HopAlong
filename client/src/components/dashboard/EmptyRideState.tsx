import { motion } from "motion/react";
import { Icon } from "@iconify/react";

const EmptyRideState = () => {
  return (
    <motion.div
      className="text-center py-20 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full -ml-16 -mb-16 blur-3xl" />

      <motion.div
        className="flex justify-center mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 5, 0, -5, 0] }}
        transition={{
          scale: { duration: 0.5, type: 'spring' },
          rotate: { delay: 0.5, duration: 4, repeat: Infinity },
        }}
      >
        <div className="w-28 h-28 bg-yellow-50 rounded-3xl flex items-center justify-center shadow-inner">
          <Icon icon="mdi:car-outline" className="text-yellow-400 text-6xl" />
        </div>
      </motion.div>

      <motion.h3
        className="text-3xl font-black text-gray-900 mb-3 tracking-tight"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Be the Pioneer!
      </motion.h3>

      <motion.p
        className="text-gray-500 max-w-sm mx-auto text-sm font-medium leading-relaxed"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Nobody is heading this way yet. Why not create your own ride and let others hop along with you?
      </motion.p>

      <motion.div
        className="mt-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-yellow-400 text-amber-900 px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-yellow-500 transition-all flex items-center gap-2 mx-auto"
        >
          <Icon icon="mdi:car-plus" className="text-xl" />
          Create Ride
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default EmptyRideState;
