import React, { useState, useEffect, useMemo } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SignIn } from "./screens/Authapp";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./screens/Home";
import Collect from "./screens/Collect";
import {ToastAndroid } from "react-native";
import AsyncStorage from '@react-native-community/async-storage';

import { AuthContext } from "./screens/context";
import CollectionList from "./screens/CollectionList";
import SplashScreen from 'react-native-splash-screen'
import {url} from './services/api/constants'
import Icon from 'react-native-vector-icons/Ionicons';
import RIcon from 'react-native-vector-icons/FontAwesome'
//Stack Navigators
const HomeStack = createStackNavigator();
const CollectStack = createStackNavigator();
const CollectListStack = createStackNavigator();
const AuthStack = createStackNavigator();
const Tabs = createBottomTabNavigator();

//Home Stack
const HomeStackScreen = () => (
  <HomeStack.Navigator
  screenOptions={{
    headerStyle: {
      backgroundColor: '#7f00ff',
      
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
          fontWeight: 'bold',
          textAlign: 'center',
          
        },

  }}>
    <HomeStack.Screen name="Home" component={Home} options={{
      title:"Kumars Cable"
      
    }}/>
  </HomeStack.Navigator>
);

//Collection Stack
const CollectStackScreen = () => (
  <CollectStack.Navigator
  screenOptions={{
    headerStyle: {
      backgroundColor: '#7f00ff',
      
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
          fontWeight: 'bold',
          textAlign: 'center',
          
        },

  }}>
    <CollectStack.Screen name="Collect" component={Collect} />
    <CollectStack.Screen name="tabs" component={TabsScreen} />
  </CollectStack.Navigator>
);

//CollectionList Stack
const CollectListStackScreen = () => (
  <CollectListStack.Navigator
  screenOptions={{
    headerStyle: {
      backgroundColor: '#7f00ff',
     
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
          fontWeight: 'bold',
          textAlign: 'center',
          
        },

  }}>
    <CollectListStack.Screen name="CollectionList" component={CollectionList} />
  </CollectListStack.Navigator>
);



//Bottom Drawer
const TabsScreen = () => (
  <Tabs.Navigator
    initialRouteName="Home"
    tabBarOptions={{
      labelStyle: {
        fontSize: 12,
        fontWeight:'bold'
      },
      activeTintColor:'#ef00ff',
      inactiveTintColor:'white',
      style: {
        backgroundColor: "#7f00ff",
      },
      keyboardHidesTabBar:true,
    }}
  >
    <Tabs.Screen
      name="Home"
      component={HomeStackScreen}
      options={{
        tabBarLabel: "Home",
        tabBarIcon:({color})=>(  
          <Icon name="ios-home" color={color} size={30} color={color}/>), 
      }}
    />
    <Tabs.Screen
      name="Collect"
      component={CollectStackScreen}
      options={{
        tabBarLabel: "Collect",
        tabBarIcon:({color}) => <RIcon name="rupee" size={30} color={color}/>,
      }}
    />
    <Tabs.Screen
      name="CollectionList"
      component={CollectListStackScreen}
      options={{
        tabBarLabel: "Collection List",
        tabBarIcon: ({color}) => (
          <RIcon name="list-ul" size={30} color={color} />
        ),
      }}
    />
  </Tabs.Navigator>
);


export default ({ navigation }) => {

  const [usertoken, setUserToken] = useState("");
  const [isLoggedIn,setIsLoggedIn] = useState(false)
  const showInvalidToast = (res) => {

    ToastAndroid.showWithGravityAndOffset(
      res,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      200
    );
  };


  async function getToken(username, password) {
    try {
      let response = await fetch(url+"api-token-auth/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      if(response.ok){
        let data = await response.json()
        setUserToken(data["token"]);
        AsyncStorage.setItem("Token", data["token"]);
        setIsLoggedIn(true)

  
      }else if(response.status == 400){
        showInvalidToast("Invalid Credentials!")
 
      }else{
        showInvalidToast(response.statusText)
      }
      
    } catch (error) {
      if (error.message === 'Timeout' 
        || error.message === 'Network request failed') {
          showInvalidToast("Network Error !please try again later")
      } else {
        showInvalidToast("error"); // rethrow other unexpected errors
      }
      
      
    }
    
  }
  useEffect(() =>{
    //SplashScreen.hide()

  },[])
 

  return (
    <AuthContext.Provider
      value={{
        getToken: getToken,
        token: usertoken,
        setToken:setUserToken,
        isLoggedIn:isLoggedIn,
        setIsLoggedIn:setIsLoggedIn,

      }}
    >
      <NavigationContainer>
        {usertoken ? (
          <TabsScreen/>
        ) : (
          <AuthStack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#7f00ff',
              
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                  fontWeight: 'bold',
                  textAlign: 'center',
                  
                },
        
          }}>
            <AuthStack.Screen name="SignIn" component={SignIn} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};
