# Assetfinder  

![Project funding](https://www.healthcat.eu/wp-content/uploads/2019/01/website_logo_head.png)

## General information

This app is intended to demonstrate finding of assets (e.g. wheelchair) in a hospital.
It relies on a Bluetooth Mesh infrastructure running on [Thingy 52 devices by Nordic Semi](https://www.nordicsemi.com/Software-and-tools/Prototyping-platforms/Nordic-Thingy-52).


This app is developed by the [Biomechanics Lab of the University Medical Center Schleswig-Holstein, Campus Luebeck](https://www.uksh.de/unfallchirurgie-luebeck/Bereiche/Orthop%C3%A4dische_+unfallchirurgische+Forschung+und+Lehre+mit+Labor+f%C3%BCr+Biomechanik+und+Biomechatronik/Einf%C3%BChrung.html).


The [HealthCAT Project](http://www.healthcat.eu/) is supported by Interreg Germany-Danmark with funds from the European Regional Development Fund. Learn more about Interreg Germany-Danmark at [www.interreg5a.eu](https://www.interreg5a.eu/).

# Expo

[Expo](https://expo.io/) is a framework and a platform for universal React applications. It is a set of tools and services built around React Native and native platforms that help you develop, build, deploy, and quickly iterate on iOS, Android, and web apps from the same JavaScript/TypeScript codebase.

## Expo quick start

This section only applies when you want to start from scratch. More information is found at the [Expo documentation](https://docs.expo.io/).

```Shell
npm install -g expo-cli
expo init Assetfinder
```

## React Navigation

[React Navigation](https://reactnavigation.org/) is an easy-to-use navigation solution based on JavaScript.

Installing dependencies into an Expo managed project
In your project directory, run:

```Shell
# basis installation
expo install @react-navigation/native 

# additional packages
expo install @react-navigation/drawer @react-navigation/bottom-tabs react-native-screens @react-navigation/stack react-native-gesture-handler react-native-reanimated react-native-safe-area-context @react-native-community/masked-view
```
This will install versions of these libraries that are compatible.

### React navigation performance optimization

```js
// Before rendering any navigation stack
import { enableScreens } from 'react-native-screens';
enableScreens();
```

## react-native-paho-mqtt
[react-native-paho-mqtt](https://www.npmjs.com/package/react-native-paho-mqtt) is a fork of [paho-client](https://www.npmjs.com/package/paho-client), this project exists to provide an ES6-ready, Promise-based, react-native compatible version of the Eclipse Paho client.

```Shell
expo install react-native-paho-mqtt
```

## react-hooks-global-state
To simplify state management [react-hooks-global-state](https://github.com/dai-shi/react-hooks-global-state) is used here. It allows for simple global state for React with Hooks API without Context API.

```Shell
expo install react-hooks-global-state
```

## redux
[React Redux](https://github.com/reduxjs/react-redux) is the official [React](https://reactjs.org/) binding for [Redux](https://redux.js.org/). It lets your React components read data from a Redux store, and dispatch actions to the store to update data.

Used here only for combineReducers in state management.

```Shell
expo install react-redux redux
```