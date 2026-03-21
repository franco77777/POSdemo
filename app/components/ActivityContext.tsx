"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ActivityType =
  | "created"
  | "updated"
  | "deleted"
  | "sold"
  | "restocked";

export interface Activity {
  id: string;
  type: ActivityType;
  productId: string;
  productName: string;
  user: string;
  timestamp: string;
  details: string;
  quantity?: number;
  amount?: number;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  getActivitiesByProduct: (productId: string) => Activity[];
  getActivitiesByType: (type: ActivityType) => Activity[];
  getActivitiesByUser: (user: string) => Activity[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const addActivity = useCallback(
    (activityData: Omit<Activity, "id" | "timestamp">) => {
      const timestamp = new Date().toISOString();
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();

      const newActivity: Activity = {
        ...activityData,
        id: `ACT-${Date.now()}-${random}`,
        timestamp,
      };

      setActivities((prev) => [newActivity, ...prev]);
    },
    []
  );

  const getActivitiesByProduct = useCallback(
    (productId: string) => {
      return activities.filter((a) => a.productId === productId);
    },
    [activities]
  );

  const getActivitiesByType = useCallback(
    (type: ActivityType) => {
      return activities.filter((a) => a.type === type);
    },
    [activities]
  );

  const getActivitiesByUser = useCallback(
    (user: string) => {
      return activities.filter((a) => a.user === user);
    },
    [activities]
  );

  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
        getActivitiesByProduct,
        getActivitiesByType,
        getActivitiesByUser,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
