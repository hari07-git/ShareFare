import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { AppTabsParamList } from "../types";
import { colors } from "../../theme/colors";
import { HomeScreen } from "../../screens/app/HomeScreen";
import { FindRideScreen } from "../../screens/app/FindRideScreen";
import { OfferRideScreen } from "../../screens/app/OfferRideScreen";
import { BookingsScreen } from "../../screens/app/BookingsScreen";
import { InboxScreen } from "../../screens/app/InboxScreen";
import { NotificationsScreen } from "../../screens/app/NotificationsScreen";
import { ProfileScreen } from "../../screens/app/ProfileScreen";
import { AdminScreen } from "../../screens/app/AdminScreen";

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: "transparent" },
        tabBarActiveTintColor: colors.primary2,
        tabBarInactiveTintColor: colors.muted
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="FindRide" component={FindRideScreen} options={{ title: "Find" }} />
      <Tab.Screen name="OfferRide" component={OfferRideScreen} options={{ title: "Offer" }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: "Bookings" }} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Alerts" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Admin" component={AdminScreen} />
    </Tab.Navigator>
  );
}

