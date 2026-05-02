import { useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface TabProps {
  label: string;
  icon?: string;
  children: React.ReactNode;
}

export const Tab = ({ children }: TabProps) => <div>{children}</div>;

interface TabGroupProps {
  children: React.ReactElement<TabProps>[];
}

const TabGroup = ({ children }: TabGroupProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = children.map((child) => ({
    label: child.props.label,
    icon: child.props.icon,
  }));

  return (
    <div className="w-full">
      <div className="flex rounded-lg bg-gray-50 p-1 mb-6">
        {tabs.map((tab, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setActiveTab(index);
            }}
            className={`flex items-center justify-center flex-1 py-2.5 px-3 text-sm font-medium rounded-md ${
              activeTab === index
                ? "bg-white text-yellow-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            whileHover={{ scale: activeTab !== index ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.icon && <Icon icon={tab.icon} className="mr-1.5 text-lg" />}
            {tab.label}
          </motion.button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children[activeTab]}
      </motion.div>
    </div>
  );
};

export default TabGroup;
