import React, { useState, useEffect, useContext,forwardRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Clipboard,
  ToastAndroid,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Modal
} from "react-native";
import moment from "moment";
import { AuthContext } from "./context";
import ErrorBoundary from 'react-native-error-boundary'
import {url} from '../services/api/constants'
import Icon from  'react-native-vector-icons/AntDesign'
import FIcon from 'react-native-vector-icons/FontAwesome'
import AsyncStorage from '@react-native-community/async-storage'

//Customer Item
function CustomerItem({ item,setCustomer }) {
  
  
  return (
    <ErrorBoundary>
    <View style={styles.item}>
      <View style={{flexDirection:'row',justifyContent:'space-between'}}>
      <Text style={{fontSize:22,textDecorationLine:'underline',color:'#00bf8f',paddingBottom:10,fontWeight:'bold',textDecorationStyle:'dashed'}}>CUSTOMER DETAILS</Text>
      <TouchableOpacity onPress={() => setCustomer('')  } >
        <Icon name='closecircle' size={25} color="red"/>
      </TouchableOpacity>

      </View>
      
      
      
      <Text style={styles.itemname}>CUSTOMER ID :{"   "}
      <Text style={styles.itemvalue}>{item.id}</Text> </Text> 
      <Text style={styles.itemname}>CUSTOMER NAME :{"   "}
      <Text style={styles.itemvalue}>{item.name}</Text></Text> 
      <Text style={styles.itemname}>STB NO :{"   "}
      <Text style={styles.itemvalue}>{item.stbno}</Text></Text> 
      <Text style={styles.itemname}>STREET :{"   "} 
      <Text style={styles.itemvalue}>{item.street}</Text></Text> 
      <Text style={styles.itemname}>PAYMENT STATUS:{"   "} 
      <Text style={item.payment_status === 'paid' ? styles.paid:styles.unpaid}>{item.payment_status.toString().toUpperCase()}</Text></Text> 
      <Text style={styles.itemname}>PAYMENT AMOUNT:{"   "}
      <Text style={styles.itemvalue}>{item.payment_amount}</Text></Text> 

     
    </View>
    </ErrorBoundary>
 

 
  );
}

function Home() {
  var date = moment().utcOffset("+05:30").format("YYYY-MM-DD");
  
  //State
  const [text, setText] = useState("");
  const [customersList,setCustomersList] = useState('')
  const [customer, setCustomer] = useState("");
  const [fetching,setFetching] = useState(false)

  const authContext = useContext(AuthContext);
  const { token,isLoggedIn,setIsLoggedIn} = authContext;
  
  const _storeData = async(res) =>{
    try {
        
        await AsyncStorage.setItem('customers',JSON.stringify(res))
        console.log("Customers Data Saved successfully")
    } catch (error) {
        console.log(error)
    }
  }
  
  const _retreiveData = async() =>{
    let value = await AsyncStorage.getItem('customers')
    if(value != null){

        setCustomersList(JSON.parse(value))
        
        console.log("Customers Data retreived")
    }else{
        getcustomers()

    }
  }
  //Toast
  const showToast = (res) =>{
    ToastAndroid.showWithGravityAndOffset(
      res,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      200
    );
  }
  
  //Getting Customer Details

  async function getcustomers() {
    try {
      let response = await fetch(
        url+"api/customers",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Token"+" "+token,
            "Content-Type": "application/json",
          },
        }
      );
      let res = await response.json();
      if(response.ok){
          _storeData(res)
          setFetching(false)
          setCustomersList(res)
          setText("");
      }
      else if(response.status == 404){
          setFetching(false)

          showToast(JSON.stringify(res))
          setText("")

      }else{
        setFetching(false)
          showToast("No Response from the server !")

        }
          

      }
  catch (error) {
    setFetching(false)
      showToast(error.message)
    }

  }
  
  function getcd(){
    
    var resData = customersList.filter(cus =>{
      return cus.stbno.includes(text.toUpperCase())
    })
    
    if(resData != ''){
      setFetching(false)
      setText('')
      setCustomer(resData)
    }else{
      setFetching(false)
      showToast("Enter a valid STB Number")

    }
    
  }

  useEffect(() =>{
    
   if(isLoggedIn){
     showToast("Succesfully Logged In")
     

   }

   if(customersList === ''){
      _retreiveData()
   }
   

   const tm = setTimeout(() =>{
    setIsLoggedIn(false)
  },3000)
  
  return () => {
    clearTimeout(tm)
  }
  

  },[])

 
  
  return (
  <SafeAreaView style={styles.container}>
  <ScrollView style={{height:'100%'}}>    
    <KeyboardAvoidingView>
      <StatusBar backgroundColor="#7f00ff"/>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <View style={styles.container}>
        <ErrorBoundary>
          <View style={styles.box}>
            <TouchableOpacity 
            style={{zIndex:1,position:'absolute',right:15,top:10}}
            onPress={() => {
              setFetching(true)
              getcustomers()}}
            disabled={fetching}>
              <FIcon name="refresh" size={30} color="red"/>
            </TouchableOpacity>
          
            <Text style={styles.label}>ENTER STB NUMBER :</Text>
            <TextInput
              style={{
                height: 50,
                width: 200,
                borderColor: "#dc2430",
                borderWidth: 2,
                borderRadius: 5,
                padding: 10,
                marginTop: 6,
                fontSize:18,
                color:'red',
                
              }}
              placeholder="ENTER STB NO."
              onChangeText={(txt) => setText(txt.toUpperCase())}
              value={text}
           
            />
            
            
            <TouchableOpacity style={styles.btn} onPress={() => {
              if(text){
                setFetching(true)
                setCustomer('')
                getcd()
              }
              else{
                showToast("Enter STB number then press submit!")
              }
            }} disabled={fetching ? true : false}>
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
            
          </View> 
          </ErrorBoundary>

         
        {
          fetching?
          <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="red" />
          <Text>Please wait...</Text>
        </View>
         
          :
          <ErrorBoundary>
          
          { customer ? 
            customer.map(item => (
              <CustomerItem item={item} setCustomer={setCustomer} key={item.id} />
            ))
          
          :null}
          </ErrorBoundary>
         
        }
          
          
          

           
          
        </View>
        
        
      
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    </ScrollView>
    </SafeAreaView>
 
  );
}

export default Home;
const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width, //for full screen
    height: '100%', //for full screen
    alignItems:'center',
    backgroundColor: "#eeff",
     
  },
  box: {

    padding: 30,
    width: "95%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#ddd",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 10,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 15,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  item: {
    padding: 20,
    width: "95%",
    height:"auto",
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#ddd",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 6,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 5,
    backgroundColor: "#fff",
    marginBottom: 50,
  },
  label: {
    marginTop: 6,
    fontSize: 20,
    fontWeight:'bold',
    paddingBottom:10,
    color:'black'
  },
  btn: {
    marginTop: 15,
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C779D0",
    borderRadius: 6,
  },
  btnCollect: {
    marginTop: 15,
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00bf8f",
    borderRadius: 6,
  },
  btnText: {
    fontSize: 20,
    color: "#fff",
  },

  itemname: {
    fontSize: 22,
    color: "#4A00E0",
    fontWeight: "bold",
    paddingBottom: 5,
  },
  paid:{
    color: "#4AE617",
    fontSize: 22,
    fontWeight: "bold",
    paddingBottom: 5,

  },
  unpaid: {
    color: "red",
    fontSize: 22,
    fontWeight: "bold",
    paddingBottom: 5,
  },
  itemvalue: {
    color: "black",
    fontSize: 22,
    fontWeight: "bold",
    paddingBottom: 5,
  },
  centeredView: {
    flex:1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom:50
  },
  modalView: {
    margin: 20,
    // backgroundColor: "#3F5EFB",
    backgroundColor: "#7F00FF",
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
    color:'#fff'
  }
});
