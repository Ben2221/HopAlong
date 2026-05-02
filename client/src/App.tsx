import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useAnimation } from "motion/react";
import { Icon } from "@iconify/react";
import "./App.css";
import GetStartedButton from "./components/GetStarted";

function App() {
  const controls = useAnimation();
  const containerRef = useRef(null);

  useEffect(() => {
    void controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    });
  }, [controls]);

  return (
    <div ref={containerRef} className="bg-gray-50 min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Community />
      <Contact />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 bg-white shadow-md z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src="/logo.svg" alt="HopAlong Logo" className="w-8 h-8 object-contain rounded-md shadow-sm" />
          <span className="font-bold text-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text">
            HopAlong
          </span>
        </motion.div>

        <div className="hidden md:flex gap-6">
          {[
            { name: "About", id: "about" },
            { name: "Features", id: "features" },
            { name: "How It Works", id: "how-it-works" },
            { name: "Community", id: "community" },
            { name: "Contact", id: "contact" }
          ].map((item, i) => (
            <motion.a
              key={i}
              href={`#${item.id}`}
              className="text-gray-700 hover:text-yellow-400 transition-colors font-medium"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              {item.name}
            </motion.a>
          ))}
        </div>

        <GetStartedButton />
      </div>
    </motion.nav>
  );
}

function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="pt-24 pb-16 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-100 to-white opacity-60 z-0"></div>

      <motion.div
        className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-8 items-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <motion.div style={{ y, opacity }}>
          <motion.span
            className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Icon icon="mdi:school" className="inline mr-1" /> Built for IIIT Kottayam Students
          </motion.span>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="block">Your Campus</span>
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text">
              Ride Revolution
            </span>
          </motion.h1>

          <motion.p
            className="text-gray-600 mb-8 text-xl max-w-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            The ultimate ride-sharing platform for IIIT Kottayam. Save money, meet peers, and transform your commute into a shared adventure.
          </motion.p>

          <div className="flex flex-wrap gap-4">
            <GetStartedButton />
            <motion.a
              href="#about"
              className="px-6 py-3 border-2 border-yellow-400 text-yellow-600 rounded-lg font-bold hover:bg-yellow-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="relative">
            <motion.div
              className="w-full h-[450px] bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden"
              whileHover={{
                rotateY: 5,
                boxShadow: "0 30px 40px -5px rgba(0, 0, 0, 0.2)",
              }}
              style={{ perspective: 1000 }}
            >
              <div className="bg-white/10 w-full h-full flex items-center justify-center backdrop-blur-sm">
                <Icon icon="mdi:car-connected" className="text-white text-[180px] drop-shadow-lg" />
              </div>
            </motion.div>

            {/* Floating Stats */}
            <motion.div
              className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl z-20 flex items-center gap-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              <div className="bg-green-100 p-3 rounded-full">
                <Icon icon="mdi:leaf" className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Eco Impact</p>
                <p className="text-xl font-bold text-gray-800">-40% CO2</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-2">Our Mission</h2>
            <h3 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Bridging the gap between <span className="text-yellow-500">Campus and Connection</span>
            </h3>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              HopAlong was born out of a simple problem: the commute between IIIT Kottayam and major travel hubs (Kottayam Railway Station, Cochin Airport) is often expensive and lonely.
            </p>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              We created a platform that doesn't just share rides, but builds a community. By enabling students to pool resources, we're making travel more sustainable, affordable, and social.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-bold text-yellow-500">100%</p>
                <p className="text-sm text-gray-500 font-medium">Safe for Students</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-500">50%</p>
                <p className="text-sm text-gray-500 font-medium">Average Cost Savings</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden flex items-center justify-center p-12">
              <Icon icon="mdi:handshake" className="text-yellow-400 text-[200px]" />
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-400 rounded-full mix-blend-multiply opacity-20 animate-pulse delay-700"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: "mdi:account-group",
      title: "Vibrant Campus Community",
      description:
        "Join a network of IIIT Kottayam students who share more than just rides—they share experiences, friendships, and a commitment to a sustainable campus lifestyle.",
    },
    {
      icon: "mdi:brain",
      title: "Smart Matchmaking",
      description:
        "Our cutting-edge algorithm pairs you with the best ride options based on your schedule and location, making your journey seamless and stress-free.",
    },
    {
      icon: "mdi:cash-multiple",
      title: "Affordable Rides",
      description:
        "Cut costs without cutting corners. Enjoy competitive fares that make your commute not just convenient but budget-friendly.",
    },
    {
      icon: "mdi:shield-check",
      title: "Privacy First",
      description: "Toggle anonymity and use unique pseudonyms. Your safety and privacy are our top priorities.",
    },
    {
      icon: "mdi:wallet",
      title: "Integrated Wallet",
      description: "No more awkward cash splits. Pay securely through our integrated wallet system.",
    },
    {
      icon: "mdi:message-text",
      title: "Real-time Chat",
      description: "Coordinate with your ride group instantly through our built-in secure messaging.",
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-2">Features</h2>
          <h3 className="text-4xl font-bold text-gray-900">Everything you need for a <span className="text-yellow-500">Smarter Commute</span></h3>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 text-yellow-500">
                <Icon icon={feature.icon} className="text-3xl" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: "mdi:account-plus",
      title: "Sign Up",
      description:
        "Create your profile with your IIIT Kottayam email and join our trusted community.",
    },
    {
      icon: "mdi:magnify",
      title: "Find Your Ride",
      description:
        "Input your travel details—from the railway station, airport, or bus stand to campus—and let our advanced algorithm do the matching.",
    },
    {
      icon: "mdi:share",
      title: "Share and Save",
      description:
        "Connect with your peers, share the ride, split the cost, and enjoy a friendly, safe journey to and from college.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-2">Process</h2>
          <h3 className="text-4xl font-bold text-gray-900">How It <span className="text-yellow-500">Works</span></h3>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-dashed bg-gray-200 z-0"></div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative z-10 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="w-20 h-20 bg-white border-4 border-yellow-400 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                <span className="text-2xl font-black text-yellow-500">{i + 1}</span>
              </div>
              <Icon icon={step.icon} className="text-yellow-400 text-4xl mb-4 mx-auto" />
              <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
              <p className="text-gray-600 leading-relaxed px-4">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section id="community" className="py-24 bg-yellow-400 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex -space-x-4 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-16 h-16 rounded-full border-4 border-yellow-400 bg-white overflow-hidden flex items-center justify-center">
                  <Icon icon="mdi:account" className="text-gray-300 text-3xl" />
                </div>
              ))}
            </div>
          </motion.div>

          <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Join 500+ IIITK Students</h3>
          <p className="text-gray-800 text-xl max-w-2xl mb-10 font-medium">
            "HopAlong has changed the way I travel. I've met so many seniors and batchmates while saving more than 500 bucks every trip!"
          </p>
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30 text-left max-w-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-yellow-500">S</div>
              <div>
                <p className="font-bold text-gray-900">Siddharth V.</p>
                <p className="text-sm text-gray-700">Batch of 2026</p>
              </div>
            </div>
            <p className="text-gray-800 italic">"Highly recommended for everyone especially during the end-semester holidays when everyone is rushing to the station!"</p>
          </div>
        </div>
      </div>

      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full -ml-48 -mb-48"></div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="md:w-1/2 p-12 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <h3 className="text-3xl font-bold mb-6">Let's Talk!</h3>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Have questions about how to join? Want to report an issue or suggest a feature? Our team of student developers is here to help.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center text-yellow-400">
                  <Icon icon="mdi:email" className="text-2xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Email Us</p>
                  <p className="font-bold">support@hopalong.iiitk</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center text-yellow-400">
                  <Icon icon="mdi:map-marker" className="text-2xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Visit Us</p>
                  <p className="font-bold">Academic Block, IIIT Kottayam</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-12 bg-white">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="Your IIITK email" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none h-32" placeholder="How can we help?"></textarea>
              </div>
              <button className="w-full py-4 bg-yellow-400 text-gray-900 font-bold rounded-xl shadow-lg hover:bg-yellow-500 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-950 text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.svg" alt="HopAlong Logo" className="w-8 h-8 object-contain rounded-md shadow-sm" />
              <span className="font-bold text-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text">
                HopAlong
              </span>
            </div>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-8">
              Empowering IIIT Kottayam students through shared mobility. Join the community and make every journey count.
            </p>
            <div className="flex gap-4">
              {[
                { icon: "mdi:instagram", href: "https://instagram.com/iiitkottayam" },
                { icon: "mdi:twitter", href: "https://x.com/Savvy2221" },
                { icon: "mdi:linkedin", href: "https://linkedin.com/company/iiit-kottayam" },
                { icon: "mdi:github", href: "https://github.com/Ben2221" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-400 hover:text-gray-900 transition-all"
                  whileHover={{ y: -5 }}
                >
                  <Icon icon={social.icon} className="text-xl" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#about" className="hover:text-yellow-400 transition-colors">About Us</a></li>
              <li><a href="#features" className="hover:text-yellow-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-yellow-400 transition-colors">How it Works</a></li>
              <li><a href="#community" className="hover:text-yellow-400 transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/guidelines" className="hover:text-yellow-400 transition-colors">Safety Guidelines</Link></li>
              <li><Link to="/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 HopAlong. Developed by the students of IIIT Kottayam.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            Built with <Icon icon="mdi:heart" className="text-red-500" /> at IIITK
          </div>
        </div>
      </div>
    </footer>
  );
}

export default App;
