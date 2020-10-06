import * as React from 'react';
import { Button, 
  Text, 
  View, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createStore } from 'react-hooks-global-state';
import { combineReducers } from 'redux';
import { Client, Message } from 'react-native-paho-mqtt';
import Constants from 'expo-constants';

import { enableScreens } from 'react-native-screens';
enableScreens(); 

// Set up an in-memory alternative to global localStorage (for the mqtt-client)
const myStorage = {
  setItem: (key, item) => {
    myStorage[key] = item;
  },
  getItem: (key) => myStorage[key],
  removeItem: (key) => {
    delete myStorage[key];
  },
};

// Create a MQTT client and connect to the (hardcoded) server
const createMQTTClient = () => {
  const client = new Client({ uri: 'wss://mqtt.webdrive.biomechatronics.de:443/mqtt', clientId: 'clientId', storage: myStorage });

  // set event handler for lost connection
  client.on('connectionLost', (responseObject) => {
    if (responseObject.errorCode !== undefined) {
      console.log('onConnectionLost');
      console.log(responseObject.errorMessage);
      MQTT_DISCONNECT();
    }
  });

  // set event handler for message received
  client.on('messageReceived', (message) => {
    switch(message.destinationName) {
      case 'healthcat/UKSH_HL/GW180/rooms/rooms':
        //console.log('Update rooms'); 
        ROOMS_UPDATE(message.payloadString);
        break;
      case 'healthcat/UKSH_HL/GW180/assets/assets':
        //console.log('Update assets'); 
        ASSETS_UPDATE(message.payloadString);
        break;
      case 'healthcat/UKSH_HL/GW180/assets/personnel':
        //console.log('Update personnel'); 
        PERSONNEL_UPDATE(message.payloadString);
        break;
      default: 
        console.log('Received: ' + message.destinationName);  
        console.log(message.payloadString);
    }
  });  

  // Connect to the broker
  client.connect()
    .then(() => {
      // Once a connection has been made, make a subscription and send a message.
      console.log('Client is connected');
      MQTT_CONNECTED();
      client.subscribe('healthcat/UKSH_HL/GW180/rooms/rooms');
      client.subscribe('healthcat/UKSH_HL/GW180/assets/assets');
      client.subscribe('healthcat/UKSH_HL/GW180/assets/personnel');
    })
    .then(() => {
      const message = new Message(JSON.stringify(
        {
          "DeviceName" : Constants.deviceName,
          "SessionID" : Constants.sessionId,
          "connected" : Date.now(),
        }
      ));
      message.destinationName = 'healthcat/UKSH_HL/GW180/clients/' + Constants.sessionId;
      client.send(message);
      console.log('Client has hailed the broker');
    })
    .catch((responseObject) => {
      if (responseObject.errorCode !== undefined) {
        console.log('Error while trying to connect, subscribe and hail the server:' + responseObject.errorMessage);
        MQTT_DISCONNECT();
      }
    });  
 
  return client;
}

 // Disconnect client from broker and return null for the client
const disconnectMQTTClient = (client) => { 
  client.disconnect()
  .then(() => {    
    console.log('Succesfully disconnected');
  })
  .catch((responseObject) => {
    if (responseObject.errorCode !== undefined) {
      console.log('Error while disconnecting:' + responseObject.errorMessage);
    }
  }); 

  return null;
}

// Initial state for the assets
const initialAssetState = [
  {
    items : [],
    id : 1,
    //name : "rollator",
    name : "Rollator",
    image : Image.resolveAssetSource(require('./assets/rollator.png')).uri,
    totalCount : 0,
    availableCount : 0,
  },
  {
    items : [],
    id : 2,
    //name : "wheelchair",
    name : "Rollstuhl",
    image : Image.resolveAssetSource(require('./assets/wheelchair.png')).uri,
    totalCount : 0,
    availableCount : 0,
  },
  {
    items : [],
    id : 3,
    //name : "ultrasound device",
    name : "Ultraschall",
    image : Image.resolveAssetSource(require('./assets/ultrasound.png')).uri,
    totalCount : 0,
    availableCount : 0,
  },
  {
    items : [],
    id : 4,
    //name : "ECG",
    name : "EKG",
    image : Image.resolveAssetSource(require('./assets/ECG.png')).uri,
    totalCount : 0,
    availableCount : 0,
  },
  {
    items : [],
    id : 5,
    //name : "contraction recorder",
    name : "Wehenschreiber",
    image : Image.resolveAssetSource(require('./assets/contraction_recorder.png')).uri,
    totalCount : 0,
    availableCount : 0,
  },
  {
    items : [],
    id : 6,
    //name : "rollboard",
    name : "Umlagerungshilfe",
    image : Image.resolveAssetSource(require('./assets/rollboard.png')).uri,
    totalCount : 0,
    availableCount : 0,
  },
  {
    items : [],
    id : 7,
    //name : "commode chair",
    name : "Toilettenstuhl",
    image : Image.resolveAssetSource(require('./assets/commode_chair.png')).uri,
    totalCount : 0,
    availableCount : 0,
  },
  {
    items : [],
    id : 8,
    //name : "stretcher",
    name : "Trage",
    image : Image.resolveAssetSource(require('./assets/stretcher.png')).uri,
    totalCount : 0,
    availbleCount : 0,
  },
];

// Global state - Initial State
const initialState = {
  mqtt : {
    isConnecting : false,
    isConnected : false,
    client : null,
  },
  rooms : [],
  personnel : [],
  assets : initialAssetState,
}

// Reducer for mqtt-connection state
const mqttReducer = (state = initialState.mqtt, action) => {
  switch (action.type) {

    // Connect to the broker
    case 'CONNECTING_MQTT':
    return {
        ...state,
        isConnecting: true,
        isConnected: false,
        client : createMQTTClient()
    };

    // We are now connected and messages are (probably flowing in)
    case 'CONNECT_MQTT':
    return {
        ...state,
        isConnecting: false,
        isConnected: true,
    };

    // Disconnect from broker
    case 'DISCONNECT_MQTT':
    return {
        ...state,
        isConnecting: false,
        isConnected: false,
        client : disconnectMQTTClient(state.client),
    };
    default:
        return state;
  }
};

// Shorthands for the mqtt-Connection
const MQTT_CONNECTED = () => dispatch({ type: 'CONNECT_MQTT' });
const MQTT_DISCONNECT = () => dispatch({ type: 'DISCONNECT_MQTT'});
const MQTT_CONNECTING = () => dispatch({ type: 'CONNECTING_MQTT' });


// Reducer for room coordinates
const roomsReducer = (state = initialState.rooms, action) => {
  switch (action.type) {
    // simply parse the new data and store it
    case 'UPDATE_ROOMS': return JSON.parse(action.rooms);
    default:
        return state;
  }
};

// Shorthands for the room coordinates
const ROOMS_UPDATE = (rooms) => dispatch({ type: 'UPDATE_ROOMS', rooms});

// Reducer for personnel trackers
const personnelReducer = (state = initialState.personnel, action) => {
  switch (action.type) {
    // simply parse the new data and store it
    case 'UPDATE_PERSONNEL': return JSON.parse(action.personnel);
    default:
        return state;
  }
};

// Shorthands for the personnel trackers
const PERSONNEL_UPDATE = (personnel) => dispatch({ type: 'UPDATE_PERSONNEL', personnel});

// Reducer for assets
const assetsReducer = (state = initialState.assets, action) => {
  switch (action.type) {
    case 'UPDATE_ASSETS': 

      // Get the description of the Asset Types
      var newAssetState = initialAssetState;
      for (var idx in newAssetState) {
        newAssetState[idx].items = []; 
        newAssetState[idx].totalCount = 0;
        newAssetState[idx].availableCount = 0;
      }
      
      // get the new Asset status and sort into the Array
      var assetList = JSON.parse(action.assets);
      for (var idx in assetList) {
        newAssetState[assetList[idx].nodeSubtype - 1].items.push(assetList[idx]);
        newAssetState[assetList[idx].nodeSubtype - 1].totalCount += 1;
        if(assetList[idx].nodeStatus === 0) 
          newAssetState[assetList[idx].nodeSubtype - 1].availableCount += 1; 
      }

    // Return only AssetTypes that are visible
    return newAssetState.filter(x => x.totalCount > 0);
     
    default:
        return state;
  }
};

// Shorthands for the assets
const ASSETS_UPDATE = (assets) => dispatch({ type: 'UPDATE_ASSETS', assets});


// Combine the reducers
const reducer = combineReducers({
  mqtt : mqttReducer,
  rooms : roomsReducer,
  personnel : personnelReducer,
  assets : assetsReducer,
});

// Create a store for the context
const { dispatch, useGlobalState } = createStore(reducer, initialState);


// Screens for the Assets

// Display details of the selected assetType
function DetailsScreen({ route, navigation }) {

  // Get the assets from global store 
  const [assets] = useGlobalState('assets');

  // Which assets are to be shown
  const relevantAssets = assets.filter(x => x.id == route.params.item.id)[0].items;

  // Display the individual item in the flatlist
  const ItemView = ({ item }) => (     
    <View style={styles.listItem}>   
      <Ionicons name = {item.nodeStatus ? 'ios-close-circle' : 'ios-checkmark-circle'} 
        size={40} 
        color =  {item.nodeStatus ? "red" : "green"} 
        style={{alignSelf:"center"}}
      />       
      <View style={{alignItems:"center",flex:1}}>
        <Text style={{fontWeight:"bold", padding:3}}>{item.nodeName}</Text>
        <Text style={{padding:2}}>Raum: {item.room}</Text>
        <Text>MAC: {item.macAddress}</Text>
      </View>        
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.listContainer}>        
      <FlatList 
        data={relevantAssets} 
        renderItem={ItemView} 
        keyExtractor={(item, index) => index.toString()} 
      />
    </View>
  </SafeAreaView>
  );
}

// Display a list of available assets
function AssetsScreen({ navigation }) {

  // Display the individual item in the flatlist
  const ItemView = ({ item }) => (     
    <View style={styles.listItem}>      
      <Image source={{uri:item.image}}  
        style= {{width:60, height:60,borderRadius:15, 
        opacity: item.availableCount > 0 ? 1 : 0.3
        }} />
      <View style={{alignItems:"center",flex:1}}>
        <Text style={{fontWeight:"bold", padding:3}}>{item.name}</Text>
        {item.availableCount > 0 ? (
          <Text style={{padding:2}}>Verfügbar in: {item.items.filter(x => x.nodeStatus == 0)[0].room}</Text>
          ) : (
            <Text style={{padding:2}}>Nicht verfügbar</Text>
          )
        }
        <Text>Insgesamt: {item.availableCount}</Text>
      </View>      
      <TouchableOpacity 
      style={{height:60,width:50, justifyContent:"center",alignItems:"center"}}>
        <Text style={{color:'#007aff'}} 
        onPress={() => navigation.navigate('Details', {item})} >Info...</Text>
      </TouchableOpacity>        
    </View>
  );

  
  // Get the assets, rooms and personnel from global store 
  const [assets] = useGlobalState('assets');

  // Get my current position from the personnel trackers
  const [personnel] = useGlobalState('personnel');
  const myPersonnel = personnel.filter(x => x.macAddress == "d26194bad006");
  const myPosition = myPersonnel === undefined ? "unknown" : myPersonnel.length <= 0 ? "unknown" : myPersonnel[0].room;

  // Get my current coordinate from the rooms
  const [rooms] = useGlobalState('rooms');
  const myRooms = rooms.filter(x => x.room == myPosition);
  const myCoordinates = myRooms === undefined ? {x:0, y:0} : myRooms.length <= 0 ? {x:0, y:0} : {x:myRooms[0].x , y:myRooms[0].y};

  //calculate the distance between myself and the assets
  var assetsWithDistance = assets;
  for (var idxType in assetsWithDistance) {
    for (var idxAsset in assetsWithDistance[idxType].items) {
      var assetRooms = rooms.filter(x => x.room == assetsWithDistance[idxType].items[idxAsset].room);
      var assetCoordinate = assetRooms === undefined ? {x:0, y:0} : assetRooms.length <= 0 ? {x:0, y:0} : {x:assetRooms[0].x , y:assetRooms[0].y}; 

      assetsWithDistance[idxType].items[idxAsset].distance = Math.abs(assetCoordinate.x - myCoordinates.x) + Math.abs(assetCoordinate.y - myCoordinates.y);
    }
    // Sort the items by distance
    assetsWithDistance[idxType].items = assetsWithDistance[idxType].items.sort((a, b) => a.distance - b.distance);
  }
  
  // show the flatlist
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.listContainer}>        
        <FlatList 
          data={assetsWithDistance} 
          renderItem={ItemView} 
          keyExtractor={(item, index) => index.toString()} 
        />
      </View>
    </SafeAreaView>
  );
}


// Create a stack navigation for display of the assets and locations
const AssetsStack = createStackNavigator();

// Assemble the stack navigator
function AssetsStackScreen({ navigation }) {
  return (
    <AssetsStack.Navigator>
      <AssetsStack.Screen name="Assets" component={AssetsScreen} options = {{title : "Geräte"}} />
      <AssetsStack.Screen 
        name="Details" 
        component={DetailsScreen}
        options={({ route }) => ({ title: route.params.item.name })} 
      />
    </AssetsStack.Navigator>
  );
}


// Show this screen and only this screen, when disconnected
function ConnectScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Nicht verbunden</Text>
      <Button 
        title="Verbinden..." 
        onPress =  { MQTT_CONNECTING }
      />      
    </View>
  );
}

// Show this screen and only this screen, while waiting for an connection
function ConnectingScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Warte auf Verbindung</Text>
      <Button 
        title="Abbrechen" 
        onPress =  { MQTT_DISCONNECT }
      />
    </View>
  );
}

// Show this screen when connected as part of the main tab navigator
function DisonnectScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Verbindung hergestellt</Text>
      <Button 
        title="Trennen..." 
        onPress =  { MQTT_DISCONNECT }
      />
    </View>
  );
}


// Create the main Tab-Navigator element
const Tab = createBottomTabNavigator();

// Assemble the tab-navigator (We're in the connected state)
function TabNavigator_Connected({ navigation }) {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Assets') {
              iconName = focused
                ? 'ios-list-box'
                : 'ios-list';
            } else if (route.name === 'Connection') {
              iconName = focused
                ? 'md-options'
                : 'ios-options';
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
      <Tab.Screen name="Assets" component={AssetsStackScreen} options = {{title : "Geräte"}}/>
      <Tab.Screen name="Connection" component={DisonnectScreen} options = {{title : "Verbindung"}} />
    </Tab.Navigator>
  );
}

// Assemble the tab-navigator (We're in the dis-connected state)
function TabNavigator_Disonnected({ navigation }) {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Connection" 
        component={ConnectScreen} 
        options = {{tabBarVisible : false}}
      />
    </Tab.Navigator>
  );
}

// Assemble the tab-navigator (We're in the connecting state)
function TabNavigator_Connecting() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Connection" 
        component={ConnectingScreen} 
        options = {{tabBarVisible : false}}
      />
    </Tab.Navigator>
  );
}





// The APP!!!
export default function App({ navigation }) {

  // get Connection State from the global context
  const [mqtt] = useGlobalState('mqtt');

  // Assemble the screens
  return (
    <NavigationContainer> 
        {mqtt.isConnecting ? (
          <TabNavigator_Connecting/>
        ) : (mqtt.isConnected ? (
            <TabNavigator_Connected/>
          ) : (
            <TabNavigator_Disonnected/>
          )
        )}  
    </NavigationContainer>
  );
}

// Stylesheets
const styles = StyleSheet.create({  
  listContainer: {
    justifyContent: 'center',
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    marginTop: 5,
  },
  listItem : {
    margin:7,
    padding:10,
    backgroundColor:"#FFF",
    width:"90%",
    flex:1,
    alignSelf:"center",
    flexDirection:"row",
    borderRadius:5
  },
});