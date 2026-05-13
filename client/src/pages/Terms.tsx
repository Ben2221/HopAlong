import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
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
            Terms of Service
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
          <div className="prose prose-yellow max-w-none text-gray-600 space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-yellow-400 pl-4">1. Acceptance of Terms</h2>
              <p className="text-lg leading-relaxed">
                By accessing or using the HopAlong platform, you agree to comply with and be bound by these Terms of Service. 
                This platform is exclusively for students and staff of IIIT Kottayam.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-yellow-400 pl-4">2. User Eligibility</h2>
              <p className="text-lg leading-relaxed">
                You must be a current student or employee of IIIT Kottayam with a valid @iiitkottayam.ac.in email address 
                to create an account and use the services provided by HopAlong.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-yellow-400 pl-4">3. Nature of Service</h2>
              <p className="text-lg leading-relaxed">
                HopAlong is a peer-to-peer ride-sharing facilitation platform. It does not provide transportation services 
                and is not a transportation carrier. All rides are organized between users at their own risk and discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-yellow-400 pl-4">4. Payment & Fare Splitting</h2>
              <p className="text-lg leading-relaxed">
                Fares are calculated based on estimated distance and fuel costs. Users agree to use the integrated wallet 
                system for fare splitting. HopAlong does not take a commission; 100% of the split fare goes to covering 
                the host's expenses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-yellow-400 pl-4">5. Limitation of Liability</h2>
              <p className="text-lg leading-relaxed">
                The developers of HopAlong and IIIT Kottayam are not liable for any accidents, injuries, losses, or 
                disputes arising from the use of the platform. Users are encouraged to exercise caution and follow safety 
                guidelines at all times.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
