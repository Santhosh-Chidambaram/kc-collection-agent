import React ,{useState,useContext,useEffect}from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Image,
  ActivityIndicator,
  StatusBar,
  ToastAndroid
} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import {AuthContext} from './context'
import { TouchableWithoutFeedback, TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


export const SignIn = ({ navigation }) => {
 const [userCred,setUserCred] = useState({
     username:'',
     password:'',
 })
 const authContext = useContext(AuthContext)
 const {getToken,setToken,setIsLoggedIn} = authContext
 const [modalVisible, setModalVisible] = useState(false);

 const [state,setState] = useState({
   isFocused:false,
   tryLogin:false

 })
 const handleChange = (name,value) =>{
    setUserCred({
        ...userCred,
        [name]:value

    });
    
 }

 const onLogin = () =>{
    getToken(userCred.username,userCred.password)
     
 }
 
 const handleFocus = event => {
  setState({ isFocused: true });
  
};

const handleBlur = event => {
  setState({ isFocused: false });
  
};

useEffect(() =>{
  async function tryAutoLogin(){
    try {
      let res = await AsyncStorage.getItem("Token")
    if(res){
      setTimeout(() =>{
        setModalVisible(true)
        setTimeout(() =>{
          AsyncStorage.getItem("Token").then((value) => setToken(value))
          setIsLoggedIn(true)
          setModalVisible(false);
        },2000)

      },2000)
      
    }
    } catch (error) {
      
    }
    
      
      
    }
    tryAutoLogin()
    
  },[])
  
  
  const showEmptyToast = () => {

    ToastAndroid.showWithGravityAndOffset(
      "Empty Credentials !",
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      150
    );
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: '#eeff' }}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <StatusBar backgroundColor='#7f00ff'/>
        <View style={styles.container}>
        <Image source={require('../assets/icon.png')} style={{ width: 130, height: 120 }}/>
          <View style={styles.card}>
            
            <TextInput
              placeholder="Username"
              value={userCred.username}
              onFocus={handleFocus}
              onBlur={handleBlur}
              underlineColorAndroid={
                state.isFocused ? '#f80759' : '#f80759'
              }
              style={{
                width: "100%",
                height: 50,
                
                borderBottomColor: "#f80759",
                borderRadius: 6,
                color: "#f80759",
                fontSize:20,
                paddingLeft:6,
                
                
              }}
              name="username"
              onChangeText={txt => handleChange("username",txt)}
              
            />
            
            <TextInput
              placeholder="Password"
             secureTextEntry={true}
             value={userCred.password}
             onFocus={handleFocus}
              onBlur={handleBlur}
              underlineColorAndroid={
                state.isFocused ? '#f80759' : '#f80759'
              }
              style={{
                marginTop: 19,
                width: "100%",
                height: 50,
                paddingLeft:6,
                borderBottomColor: "#f80759",
                borderRadius: 6,
                color: "#f80759",
                fontSize:20,

                
              }}
              
              onChangeText={txt => handleChange("password",txt)}
            />
            <TouchableOpacity style={styles.button} onPress={() => {
              if(userCred.username != '' && userCred.password != ''){
                onLogin()
                setState({tryLogin:true})
              }else{

                  showEmptyToast()
                  
              }
              }} title="Login">
                {state.tryLogin
                ?
                <>
                  <ActivityIndicator size="large" color="#0000ff" />
                  <Text style={styles.btnText}>Logging In</Text>

                </>
                
                :
                <Text style={styles.btnText}>Log In</Text>
                }
                
            </TouchableOpacity>
            
        </View>
        <View style={styles.centeredView}>
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                  <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.modalText}>Please wait user auto logging in!</Text>

                    
                
                  </View>
                </View>
              </Modal>

     
        </View> 
        </View>

        
          
      </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>

  );
};


const styles = StyleSheet.create({
 container:{
  backgroundColor:'#eeff',
  height:"100%",
  alignItems:'center',
  paddingTop:"30%",

 },
  card: {
    padding: 40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    
    

  },
  image: {

    resizeMode: "cover",

  },
  button: {
    marginTop:22,
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems: "center",
    backgroundColor: "#f80759",
    padding: 10,
    borderRadius:8,
    width:150,
    
  },
  btnText:{
        fontSize:20,
        color:'#fff',

  },
  fixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
  },
  modalView: {
    margin: 20,
    // backgroundColor: "#3F5EFB",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },

  modalText: {
  
    textAlign: "center",
    fontWeight: "bold",
    color:'#f80759'
  }

});
