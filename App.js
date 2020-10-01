import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Client, Message } from 'react-native-paho-mqtt';
import Constants from 'expo-constants';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';

enableScreens();

//Set up an in-memory alternative to global localStorage
const myStorage = {
  setItem: (key, item) => {
    myStorage[key] = item;
  },
  getItem: (key) => myStorage[key],
  removeItem: (key) => {
    delete myStorage[key];
  },
};

// A very simple reducer
function counter(state, action) {
  if (typeof state === 'undefined') {
    return 0;
  }

  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}

// A very simple store
let store = createStore(combineReducers({ count: counter }));

// A screen!
function Counter({ count, dispatch, navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{count}</Text>
      <Button
        title="Increment"
        onPress={() => dispatch({ type: 'INCREMENT' })}
      />
      <Button
        title="Decrement"
        onPress={() => dispatch({ type: 'DECREMENT' })}
      />
    </View>
  );
}

// Connect the screens to Redux
let CounterContainer = connect(state => ({ count: state.count }))(Counter);

// Create a client instance
const client = new Client({ uri: 'ws://mqtt.eclipse.org:80/mqtt', clientId: 'clientId', storage: myStorage });

// set event handlers
client.on('connectionLost', (responseObject) => {
  if (responseObject.errorCode !== 0) {
    console.log(responseObject.errorMessage);
  }
});

client.on('messageReceived', (message) => {
  console.log(message.payloadString);
  store.dispatch({ type: 'INCREMENT' })
});
 
// connect the client
client.connect()
  .then(() => {
    // Once a connection has been made, make a subscription and send a message.
    console.log('onConnect');
    return client.subscribe('/HealthCAT/#');
  })
  .then(() => {
    const message = new Message(JSON.stringify(
      {
        "DeviceName" : Constants.deviceName,
        "SessionID" : Constants.sessionId,
        "UniqueID" : Constants.installationId
      }
    ));
    //message.payloadString = helloMsg.
    message.destinationName = '/HealthCAT/client';
    client.send(message);
  })
  .catch((responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
    }
  });

// Create our stack navigator
let RootStack = createStackNavigator();

// Render the app container component with the provider around it
export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootStack.Navigator>
          <RootStack.Screen name="Counter" component={CounterContainer} />
        </RootStack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// export default function App() {
//   return (

//     <Provider store={store}>
//       <NavigationContainer>
//         <View style={styles.container}>
//           <Text>Open up App.js to start working on your app!</Text>
//           <StatusBar style="auto" />
//         </View>
//       </NavigationContainer>
//     </Provider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
