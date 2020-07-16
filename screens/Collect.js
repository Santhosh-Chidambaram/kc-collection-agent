import React, { useState, useContext, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ToastAndroid,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  TouchableHighlight,
  ScrollView,
  SafeAreaView

} from "react-native";
import moment from "moment";
import {url} from '../services/api/constants'
//Context Import
import { AuthContext } from "./context";

import ErrorBoundary from 'react-native-error-boundary'

//Collect Component 

export default function Collect() {
  
  var date = moment().utcOffset("+05:30").format("YYYY-MM-DD");
  const authContext = useContext(AuthContext);
  const { token } = authContext;

  //State
  const [modalVisible, setModalVisible] = useState(false);
  const [sendPaymentUpdate,setSendPaymentUpdate] =useState(false)
  const [showPhone,setShowPhone] = useState(false)
  const [cid,setCID] = useState("")
  const [cusdetail, SetCusDetail] = useState({
    cus_id: "",
    payment_status: "paid",
    payment_date: date,
    payment_amount: "",
    setupbox:"",
    phone:'0',
  });

  const [res,setRes] = useState({
    customer:'',
    collected_amount:''

  })


  //Send payment of Customer to server
  async function sendUpdate() {
    try {
      let response;
      {
        showPhone && cusdetail.phone != null && cusdetail.phone != '0'
          ? (response = await fetch(url+"api/customer/payment/update/" + cusdetail.cus_id, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Token " + token,
            },
            body: JSON.stringify({
              customer: cusdetail.cus_id,
    
              payment_date: moment().format(),
              payment_status: cusdetail.payment_status,
              
    
              collected_amount: cusdetail.payment_amount,
              collection_agent:cid,
              phone:cusdetail.phone,
              stb:cusdetail.setupbox.toUpperCase()
            }),
          }))
          : (response = await fetch(url+"api/customer/payment/update/" + cusdetail.cus_id, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Token " + token,
            },
            body: JSON.stringify({
              customer: cusdetail.cus_id,
    
              payment_date: moment().format(),
              payment_status: cusdetail.payment_status,
              
    
              collected_amount: cusdetail.payment_amount,
              collection_agent:cid,
              
              stb:cusdetail.setupbox.toUpperCase()
            }),
          }))
      }
    
      let res = await response.json()
      console.log(res)  
        if(response.ok){
          setRes({
            customer:res.customer,
            collected_amount:res.collected_amount
          })
          setModalVisible(true) 
          SetCusDetail({
            cus_id:'',
            payment_amount:'',
            payment_status:'paid',
            payment_date:date,
            phone:'0',
          });         

        }else if(response.status == 400){
          
            showToast("Customer Payment Amount has already collected")

            

        }else{
            showToast("Please check the customerid or STB number")
        }
 
           
  
    } catch (error) {
      console.log(error.message)

    
    }
  }
 
  useEffect(() => {
    async function getCollectorId(){
      try {
       let response =  await fetch(url + "api/getuserid",{
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Token " + token,
          },
          
        })
         let res = await response.json()
          if(response.ok) {
           
            console.log(res)
            setCID(res.userid)
            if(res.showPhoneField){
              setShowPhone(res.showPhoneField)
            }

           }else{
             showErrorToast()
           }
        
      } catch (error) {
        showToast(error)
        
      }
        

    }
    
  if(sendPaymentUpdate){
    sendUpdate();
       
  }
    const tm = setTimeout(() =>{
      setModalVisible(false)
    },4000)
    
      setSendPaymentUpdate(false)
    
      if(cid == ''){
        getCollectorId()
      }
  return () =>{
    clearTimeout(tm)
  }
    
      

  }, [sendPaymentUpdate,modalVisible]);
  
  const handleChange = (name, value) => {
    SetCusDetail({
      ...cusdetail,
      [name]: value,
    });
  };

  const showErrorToast = () => {

    ToastAndroid.showWithGravityAndOffset(
      "Payment Already Collected!",
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      200
    );
  };
  const showToast = (res) => {

    ToastAndroid.showWithGravityAndOffset(
      res,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      200
    );
  };
  return (
    <KeyboardAvoidingView>
      
        <SafeAreaView >
        <ScrollView contentContainerStyle={{
          height:'100%',
          backgroundColor:'white'
        }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            
           <ErrorBoundary>
            <View style={styles.box}>
              <Text style={styles.label}>Customer Id:</Text>
              <TextInput
                style={{
                  height: 45,
                  width: 250,
                  borderColor: "#F0057E",
                  borderWidth: 2,
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 6,
                  fontSize:18,
                }}
                keyboardType="numeric"
                placeholder="Customer Id."
                name="cus_id"
                onChangeText={(txt) => handleChange("cus_id", txt)}
                value={cusdetail.cus_id}
              />
              <Text style={styles.label}>Setupbox No:</Text>
              <TextInput
                
                style={{
                  height: 45,
                  width: 250,
                  borderColor: "#F0057E",
                  borderWidth: 2,
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 6,
                  fontSize:18,
                }}
                placeholder="Setupbox No."
                name="setupbox"
                onChangeText={(txt) => handleChange("setupbox", txt)}
                value={cusdetail.setupbox}
              />
              
              <Text style={styles.label}>Collected Amount:</Text>
              <TextInput
                style={{
                    height: 45,
                    width: 250,
                    borderColor: "#F0057E",
                    borderWidth: 2,
                    borderRadius: 5,
                    padding: 10,
                    marginTop: 6,
                    fontSize:18,
                }}
                placeholder="Collected Amount."
                name="payment_amount"
                keyboardType="numeric"
                onChangeText={(txt) => handleChange("payment_amount", txt)}
                value={cusdetail.payment_amount}
              />
              {
                showPhone?
                <>
                 <Text style={styles.label}>Phone:</Text>
                  <TextInput
                    keyboardType="numeric"
                    style={{
                      height: 45,
                      width: 250,
                      borderColor: "#F0057E",
                      borderWidth: 2,
                      borderRadius: 5,
                      padding: 10,
                      marginTop: 6,
                      fontSize:18,
                    }}
                    placeholder="Phone No."
                    name="phone"
                    onChangeText={(txt) => SetCusDetail({...cusdetail,phone:txt.toString()})}
                    value={cusdetail.phone}
                  />
                </>
               
                :
                null
              }
              <Text style={styles.label}>Payment Status:</Text>
              <TextInput
                style={{
                    height: 45,
                    width: 250,
                    borderColor: "#F0057E",
                    borderWidth: 2,
                    borderRadius: 5,
                    padding: 10,
                    marginTop: 6,
                    fontSize:18,
                }}
                placeholder="paid"
                onChangeText={(txt) => handleChange("payment_status", txt)}
                value={cusdetail.payment_status}
                name="payment_status"
              />
              <Text style={styles.label}>Payment Date:</Text>
              <TextInput
                style={{
                    height: 45,
                    width: 250,
                    borderColor: "#F0057E",
                    borderWidth: 2,
                    borderRadius: 5,
                    padding: 10,
                    marginTop: 6,
                    fontSize:18,
                }}
                placeholder="paid"
                onChangeText={(txt) => handleChange("payment_date", txt)}
                name="payment_date"
                value={cusdetail.payment_date}
              />
              <TouchableOpacity
                style={styles.btnCollect}
                onPress={() => {
                    
                    if(cusdetail.id != '' && cusdetail.payment_amount != ''){
                        setSendPaymentUpdate(true)
                        
                    }else{
                        showToast('Fill all details then press collect!')
                    }
                    
                  
                  
                }}
              >
                <Text style={styles.btnText}>Collect</Text>
              </TouchableOpacity>
            </View>
            </ErrorBoundary>
            
      <View style={styles.centeredView}>
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                
                
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
              <Text style={styles.modalText}>Payment of Rs.{res.collected_amount} Successfully Collected for {res.customer} !</Text>

                    
                
                  </View>
                </View>
              </Modal>

     
        </View> 
          </View>
          </TouchableWithoutFeedback>
          </ScrollView>
          </SafeAreaView>
      
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
    width: Dimensions.get("window").width, //for full screen
    height: "100%", //for full screen
    alignItems: "center",
    backgroundColor: "#eeff",
  },
  fcontainer: {
    overflow: "scroll",
  },
  box: {
    padding: 20,
    width: "90%",
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
    marginTop: 10,
    backgroundColor: "#fff",

  },
  label: {
    marginTop: 6,
    fontSize: 20,
    fontWeight:'bold',
    color:'black'
    
  },
  btn: {
    marginTop: 15,

    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#59C173",
    borderRadius: 6,
  },
  btnCollect: {
    marginTop: 15,
    width: 100,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00bf8f",
    borderRadius: 6,
  },
  btnText: {
    fontSize: 20,
    color: "#fff",
  },
  itemText: {
    fontSize: 22,
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom:50
  },
  modalView: {
    margin: 20,
    // backgroundColor: "#3F5EFB",
    backgroundColor: "#00bf8f",
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
