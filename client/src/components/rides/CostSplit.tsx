import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface RideCost {
  memberId: string;
  name: string;
  distance: number;
  amount: number;
  isPaid?: boolean;
  sharePercentage?: number;
}

interface CostSplitProps {
  costs: RideCost[];
  totalCost: number;
  isLoading?: boolean;
}

const CostSplit = ({ costs, totalCost, isLoading = false }: CostSplitProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm animate-pulse p-5 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Calculate total distance
  const totalDistance = costs.reduce((sum, cost) => sum + cost.distance, 0);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">Cost Breakdown</h3>
        <motion.div
          className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          ₹{totalCost.toFixed(2)}
        </motion.div>
      </div>

      {totalCost === 0 ? (
        <motion.div
          className="text-center py-8 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Icon
            icon="mdi:cash-check"
            className="text-5xl text-yellow-300 mb-3"
          />
          <p>No costs have been added to this ride yet.</p>
          <p className="text-sm">The ride owner can add expenses later.</p>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-center mb-6">
            <motion.div
              className="w-full bg-gray-200 rounded-full h-2.5"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {costs.map((cost, index) => {
                // Calculate width percentage based on distance
                const widthPercentage = (cost.distance / totalDistance) * 100;
                // Calculate position (sum of all previous percentages)
                const position = costs
                  .slice(0, index)
                  .reduce(
                    (sum, c) => sum + (c.distance / totalDistance) * 100,
                    0
                  );

                return (
                  <motion.div
                    key={cost.memberId}
                    className="h-full rounded-full"
                    style={{
                      width: `${widthPercentage.toString()}%`,
                      backgroundColor: index % 2 === 0 ? "#FBBF24" : "#F59E0B",
                      position: "absolute",
                      left: `${position.toString()}%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage.toString()}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  />
                );
              })}
            </motion.div>
          </div>

          <div className="space-y-3">
            {costs.map((cost, index) => (
              <motion.div
                key={cost.memberId}
                className="flex items-center p-3 border border-gray-100 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: "#FAFAFA" }}
              >
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 mr-3">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="font-medium">{cost.name}</div>
                  <div className="text-sm text-gray-500">
                    {cost.distance.toFixed(1)} km (
                    {((cost.distance / totalDistance) * 100).toFixed(0)}%)
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    ₹{cost.amount.toFixed(2)}
                  </div>
                  {cost.isPaid ? (
                    <div className="text-xs text-green-500 font-medium">
                      Paid
                    </div>
                  ) : (
                    <div className="text-xs text-amber-500 font-medium">
                      Unpaid
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            className="w-full py-3 mt-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-md font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Settle Up
          </motion.button>
        </>
      )}
    </motion.div>
  );
};

export default CostSplit;
