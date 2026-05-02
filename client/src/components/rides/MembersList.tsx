import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface Member {
  id: string;
  firstName: string;
  lastName?: string;
  profilePic?: string;
  isOwner?: boolean;
}

interface MembersListProps {
  members: Member[];
  isLoading?: boolean;
}

const MembersList = ({ members, isLoading = false }: MembersListProps) => {
  // Helper to get initials from name
  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5 animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        Ride Participants ({members.length})
      </h3>

      <div className="space-y-4">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            className="flex items-center p-3 rounded-lg hover:bg-gray-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, backgroundColor: "#fef3c7" }}
          >
            {member.profilePic ? (
              <img
                src={member.profilePic}
                alt={`${member.firstName} ${member.lastName ?? ""}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-white font-medium">
                {getInitials(member.firstName, member.lastName)}
              </div>
            )}

            <div className="ml-4 flex-1">
              <div className="font-medium text-gray-900">
                {member.firstName} {member.lastName ?? ""}
                {member.isOwner && (
                  <span className="ml-2 text-xs py-0.5 px-2 bg-yellow-100 text-yellow-800 rounded-full">
                    Owner
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">Passenger</div>
            </div>

            <motion.button
              className="text-gray-400 hover:text-yellow-500"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon icon="mdi:dots-vertical" className="text-xl" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MembersList;
