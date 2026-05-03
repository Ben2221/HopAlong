import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  image?: string;
  onClick: () => void;
  primary?: boolean;
}

const ServiceCard = ({ title, description, icon, image, onClick, primary = false }: ServiceCardProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl p-6 text-left flex flex-col justify-between h-56 transition-all shadow-sm hover:shadow-xl ${
        primary 
          ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
          : 'bg-white text-gray-900 border border-gray-100 hover:border-yellow-200'
      }`}
    >
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${
          primary ? 'bg-white/20 text-white' : 'bg-yellow-50 text-yellow-500'
        }`}>
          <Icon icon={icon} />
        </div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className={`text-sm ${primary ? 'text-yellow-100' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>

      {image && (
        <img 
          src={image} 
          alt={title} 
          className="absolute -right-4 -bottom-4 w-40 h-40 object-contain opacity-80 group-hover:scale-110 transition-transform"
        />
      )}

      <div className="relative z-10 mt-4 flex items-center gap-1 text-sm font-bold">
        <span>Get Started</span>
        <Icon icon="mdi:arrow-right" />
      </div>
    </motion.button>
  );
};

export default ServiceCard;
