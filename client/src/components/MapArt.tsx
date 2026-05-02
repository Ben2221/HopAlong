import { motion } from "motion/react";
import { Icon } from "@iconify/react";

const MapArt = () => {
  return (
    <motion.div
      className="relative w-full h-full min-h-[400px] bg-gray-50 rounded-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      {/* Map background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>

      {/* Abstract road patterns */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,150 C100,50 200,250 400,150 S600,250 800,100"
          fill="none"
          stroke="#e5e5e5"
          strokeWidth="30"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.path
          d="M0,350 C150,450 250,250 450,350 S650,250 800,300"
          fill="none"
          stroke="#e5e5e5"
          strokeWidth="20"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />
        <motion.path
          d="M200,0 C150,150 350,250 250,450 S400,550 350,600"
          fill="none"
          stroke="#e5e5e5"
          strokeWidth="25"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
        />
      </svg>

      {/* Animated elements */}
      <motion.div
        className="absolute top-1/4 left-1/3"
        animate={{
          y: [-5, 5, -5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <motion.div
          className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2 rounded-full shadow-lg"
          whileHover={{ scale: 1.2 }}
        >
          <Icon icon="mdi:map-marker" className="text-white text-2xl" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 right-1/4"
        animate={{
          y: [5, -5, 5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5,
        }}
      >
        <motion.div
          className="bg-yellow-100 p-2 rounded-full shadow-lg"
          whileHover={{ scale: 1.2 }}
        >
          <Icon icon="mdi:map-marker" className="text-amber-500 text-2xl" />
        </motion.div>
      </motion.div>

      {/* Car animation */}
      <motion.div
        className="absolute"
        initial={{ x: -50, y: 250 }}
        animate={{
          x: [0, 700, 700, 0, 0],
          y: [250, 250, 400, 400, 250],
          rotate: [0, 0, 90, 180, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        }}
      >
        <Icon icon="mdi:car-sports" className="text-yellow-400 text-3xl" />
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 right-10 text-amber-200 opacity-60"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Icon icon="mdi:compass-outline" className="text-6xl" />
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-10 text-yellow-300 opacity-50"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Icon icon="mdi:map-outline" className="text-5xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          className="bg-white px-4 py-2 rounded-full shadow-xl flex items-center"
          whileHover={{ scale: 1.05 }}
          animate={{
            y: [-3, 3, -3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Icon
            icon="mdi:car-connected"
            className="text-yellow-400 text-xl mr-2"
          />
          <span className="text-sm font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text">
            Hop Along!
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MapArt;
