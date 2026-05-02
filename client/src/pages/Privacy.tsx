import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/80 font-bold mb-6 hover:text-white transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Icon icon="mdi:arrow-left" /> Back to Home
          </motion.button>
          <motion.h1 
            className="text-4xl md:text-5xl font-black text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Privacy Policy
          </motion.h1>
          <p className="text-yellow-100 mt-4 text-lg">Last Updated: May 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 pb-20">
        <motion.div
          className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="prose prose-yellow max-w-none text-gray-600 space-y-12">
            <section className="flex gap-6 items-start">
               <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 shrink-0">
                  <Icon icon="mdi:database" className="text-2xl" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Data We Collect</h2>
                  <p className="text-lg leading-relaxed">
                    We collect your name, IIIT Kottayam email address, and profile details to verify your identity. 
                    When you use the app, we also collect real-time location data (only during active rides) and 
                    wallet transaction history.
                  </p>
               </div>
            </section>

            <section className="flex gap-6 items-start">
               <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 shrink-0">
                  <Icon icon="mdi:shield-check" className="text-2xl" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Information</h2>
                  <p className="text-lg leading-relaxed">
                    Your information is used to facilitate ride-sharing, ensure campus safety, and process 
                    fare-splitting transactions. We do not sell your data to third parties.
                  </p>
               </div>
            </section>

            <section className="flex gap-6 items-start">
               <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 shrink-0">
                  <Icon icon="mdi:incognito" className="text-2xl" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Anonymity & Pseudonyms</h2>
                  <p className="text-lg leading-relaxed">
                    We offer a unique "Privacy Mode" where you can mask your real identity with a randomly generated 
                    pseudonym. In this mode, other users will only see your pseudonym and role, not your real name 
                    or exact profile details.
                  </p>
               </div>
            </section>

            <section className="flex gap-6 items-start">
               <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 shrink-0">
                  <Icon icon="mdi:map-marker-off" className="text-2xl" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Location Privacy</h2>
                  <p className="text-lg leading-relaxed">
                    Location tracking is only active when you are a driver on an active ride or a rider requesting 
                    a ride. We do not track your location in the background when the app is not in use for a journey.
                  </p>
               </div>
            </section>

            <section className="flex gap-6 items-start">
               <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 shrink-0">
                  <Icon icon="mdi:lock" className="text-2xl" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                  <p className="text-lg leading-relaxed">
                    We use industry-standard encryption to protect your data. However, as this is a campus-level 
                    project, we encourage users to not store sensitive personal information beyond what is required 
                    for the app's core functionality.
                  </p>
               </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
