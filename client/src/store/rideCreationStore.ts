import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Types definition
interface Creator {
  firstName: string;
  lastName: string;
}

interface PrimaryRoute {
  id: string;
  creatorId: string;
  startPlaceName: string;
  endPlaceName: string;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  distance: number;
  memberRideId: string | null;
  creator: Creator;
}

interface Ride {
  id: string;
  primaryRouteId: string;
  ownerId: string;
  start: string;
  totalCost: number;
  createdAt: string;
  primaryRoute: PrimaryRoute;
  owner: Creator;
}

export interface RideMatch {
  ride: Ride;
  timeDifference: number;
  overlapPercentage: number;
  overlapSegmentCount: number;
}

interface RideState {
  rides: RideMatch[];

  // Actions
  setRides: (rides: RideMatch[]) => void;
  addRide: (ride: RideMatch) => void;
  removeRide: (rideId: string) => void;
  updateRide: (rideId: string, updatedRide: Partial<RideMatch>) => void;
  clearRides: () => void;
}

export const useRideStore = create<RideState>()(
  persist(
    (set) => ({
      rides: [],

      setRides: (rides: RideMatch[]): void => {
        set(() => ({ rides }));
      },

      addRide: (ride: RideMatch): void => {
        set((state) => ({
          rides: [...state.rides, ride],
        }));
      },

      removeRide: (rideId: string): void => {
        set((state) => ({
          rides: state.rides.filter((match) => match.ride.id !== rideId),
        }));
      },

      updateRide: (rideId: string, updatedRide: Partial<RideMatch>): void => {
        set((state) => ({
          rides: state.rides.map((match) =>
            match.ride.id === rideId ? { ...match, ...updatedRide } : match
          ),
        }));
      },

      clearRides: (): void => {
        set(() => ({ rides: [] }));
      },
    }),
    {
      name: "hopalong-rides-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
