import * as React from 'react';
import { Button, Text, View, AsyncStorage } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { enableScreens } from 'react-native-screens';
enableScreens(); 

// Context for the Connection state
const ConnectionContext = React.createContext();

function DetailsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Details!</Text>
    </View>
  );
}

function AssetsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Geräte</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

function ConnectionScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings screen</Text>
      {/* <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      /> */}
    </View>
  );
}

const AssetsStack = createStackNavigator();

function AssetsStackScreen() {
  return (
    <AssetsStack.Navigator>
      <AssetsStack.Screen name="Geräte" component={AssetsScreen} />
      <AssetsStack.Screen 
        name="Details" 
        component={DetailsScreen} 
      />
    </AssetsStack.Navigator>
  );
}

/* const SettingsStack = createStackNavigator();

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="Verbindung" component={SettingsScreen} />
      <SettingsStack.Screen name="Details" component={DetailsScreen} />
    </SettingsStack.Navigator>
  );
} */

const Tab = createBottomTabNavigator();

export default function App({ navigation }) {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'CONNECTING':
          return {
            ...prevState,
            isConnecting: true,
            isConnected: false,
          };
        case 'CONNECT_MQTT':
          return {
            ...prevState,
            isConnecting: false,
            isConnected: true,
          };
        case 'DISCONNECT_MQTT':
          return {
            ...prevState,
            isConnecting: true,
            isConnected: false,
          };
      }
    },
    {      
      isConnecting: false,
      isConnected: false,
    }
  );

  const connectionContext = React.useMemo(
    () => ({
      connect: () => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        dispatch({ type: 'CONNECTING'});
      },

      disconnect: () => dispatch({ type: 'DISCONNECT_MQTT' }),      
    }),
    []
  );

  return (
    <ConnectionContext.Provider value={connectionContext}>
      <NavigationContainer>
        <Tab.Navigator  
          screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Geräte') {
                  iconName = focused
                    ? 'ios-list-box'
                    : 'ios-list';
                } else if (route.name === 'Verbindung') {
                  iconName = 'ios-radio';
                }

                // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
            tabBarOptions={{
              activeTintColor: 	'#007aff',
              inactiveTintColor: '#8e8e93',
            }} 
        > 
        {state.isConnected ? (
          <Tab.Screen 
            name="Geräte" 
            component={AssetsStackScreen} 
          />
          <Tab.Screen 
            name="Verbindung" 
            component={ConnectionScreen} 
          />
        ) : (
          <Tab.Screen 
            name="Verbindung" 
            component={ConnectionScreen}  
            options = {{tabBarVisible : false}}
          />
        )}
        </Tab.Navigator>
      </NavigationContainer>
    </ConnectionContext.Provider>
  );
}
