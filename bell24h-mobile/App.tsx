import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { store } from './src/store/store';
import VoiceRFQScreen from './src/screens/VoiceRFQScreen';
import WalletScreen from './src/screens/WalletScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SupplierScreen from './src/screens/SupplierScreen';
import RFQListScreen from './src/screens/RFQListScreen';
import VideoRFQScreen from './src/screens/VideoRFQScreen';
import { theme } from './src/theme';
import { MatchExplanationScreen } from './src/screens/MatchExplanationScreen';
import { SupplierExplanationScreen } from './src/screens/SupplierExplanationScreen';
import { MarketInsightsScreen } from './src/screens/MarketInsightsScreen';
import { PricingDashboardScreen } from './src/screens/PricingDashboardScreen';
import { TradeOpportunitiesScreen } from './src/screens/TradeOpportunitiesScreen';
import { LogisticsTrackingScreen } from './src/screens/LogisticsTrackingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const RFQStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="VideoRFQ"
      component={VideoRFQScreen}
      options={{ title: 'Video RFQ' }}
    />
    <Stack.Screen
      name="MatchExplanation"
      component={MatchExplanationScreen}
      options={{ title: 'Match Explanation' }}
    />
    <Stack.Screen
      name="SupplierExplanation"
      component={SupplierExplanationScreen}
      options={{ title: 'Supplier Risk Analysis' }}
    />
  </Stack.Navigator>
);

// Bottom Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'RFQ':
              iconName = 'video-library';
              break;
            case 'Market':
              iconName = 'show-chart';
              break;
            case 'Pricing':
              iconName = 'attach-money';
              break;
            case 'Trade':
              iconName = 'public';
              break;
            case 'Logistics':
              iconName = 'local-shipping';
              break;
            default:
              iconName = 'home';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Voice RFQ"
        component={VoiceRFQScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="mic" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RFQ"
        component={RFQStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-balance-wallet" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Suppliers"
        component={SupplierScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="business" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen name="Market" component={MarketInsightsScreen} />
      <Tab.Screen name="Pricing" component={PricingDashboardScreen} />
      <Tab.Screen name="Trade" component={TradeOpportunitiesScreen} />
      <Tab.Screen name="Logistics" component={LogisticsTrackingScreen} />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen 
              name="Main" 
              component={TabNavigator} 
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
} 