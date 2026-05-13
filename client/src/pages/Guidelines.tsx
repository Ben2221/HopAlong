import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const SafetyGuidelines = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen relative overflow-hidden">
      {/* Floating Background Patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-200/20 rounded-full blur-3xl -mr-64 -mt-64 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse delay-1000"></div>

      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 pt-24 pb-32 relative">
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white font-bold rounded-full mb-8 hover:bg-white/30 transition-all border border-white/30 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
          >
            <Icon icon="mdi:arrow-left" /> Back to Home
          </motion.button>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Stay <span className="text-gray-900/20">Safe.</span> <br />
            Travel <span className="text-gray-900/20">Together.</span>
          </motion.h1>
          
          <motion.p 
            className="text-yellow-100 text-xl max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Guidelines designed by the IIIT Kottayam community to ensure every journey is secure, respectful, and reliable.
          </motion.p>
        </div>

        {/* Wave pattern at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gray-50 rounded-t-[3rem]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 pb-24 relative z-20">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: "mdi:shield-account",
              title: "Verify Your Peers",
              desc: "Ensure you ride only with verified IIITK students. Check profile details and pseudonyms before starting a journey.",
              color: "bg-blue-500"
            },
            {
              icon: "mdi:car-info",
              title: "Vehicle Safety",
              desc: "Drivers must maintain vehicle health. All passengers are required to use seatbelts and respect the host's vehicle.",
              color: "bg-green-500"
            },
            {
              icon: "mdi:account-group",
              title: "Community Respect",
              desc: "Zero tolerance for harassment or discrimination. We build a safe space for all genders and batches of IIITK.",
              color: "bg-purple-500"
            },
            {
              icon: "mdi:map-marker-radius",
              title: "Smart Pickups",
              desc: "Always choose well-lit, campus-authorized pickup points. Use the 'Share Live Location' feature for extra peace of mind.",
              color: "bg-orange-500"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white hover:shadow-2xl transition-all group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className={`w-16 h-16 ${item.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon icon={item.icon} className="text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed text-lg font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* SOS Highlight Card */}
        <motion.div
          className="mt-10 bg-gray-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.5)]">
              <Icon icon="mdi:alert-octagon" className="text-5xl" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-wider">Emergency Protocol</h2>
              <p className="text-gray-400 text-xl leading-relaxed max-w-2xl">
                In any unsafe situation, tap the <span className="text-red-500 font-bold">SOS button</span> on the active ride screen. This immediately alerts campus security and shares your live coordinates with designated emergency contacts.
              </p>
            </div>
          </div>
          
          {/* Decorative background for SOS card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/5 rounded-full -ml-16 -mb-16"></div>
        </motion.div>
      </div>

      {/* Footer-like text */}
      <div className="text-center pb-20">
        <p className="text-gray-400 font-medium italic">"Building a safer IIIT Kottayam, one ride at a time."</p>
      </div>
    </div>
  );
};

export default SafetyGuidelines;
