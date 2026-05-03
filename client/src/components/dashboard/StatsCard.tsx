import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: string;
}

const StatsCard = ({ label, value, icon, trend, color = "text-yellow-500" }: StatsCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gray-50 ${color}`}>
        <Icon icon={icon} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <span className="text-[10px] font-bold text-green-500 flex items-center gap-0.5">
              <Icon icon="mdi:trending-up" /> {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
