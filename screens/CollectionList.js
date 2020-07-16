import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  RefreshControl,
  View,
  Text,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,

} from "react-native";
import moment from "moment";
import {url} from '../services/api/constants'
import { AuthContext } from "./context";
import { OptimizedFlatList } from "react-native-optimized-flatlist";

function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

//Collectio List Render Item
const RenderItem = ({ item,index }) => {
  return (
      <View style={styles.clistContainer}>
        <Text style={{position:'absolute',right:10,top:10}} >{moment(item.collected_date).format('LT')}</Text>
         <View style={{
           justifyContent:'center',
           alignItems:'center',
           backgroundColor:'#8e2de2',
           height:60,
           width:60,
           borderRadius:50,
           marginLeft:5,

           
           }}>
           <Text style={{color:'white',fontSize:20,}}>{index+1}</Text>
         </View>
         <View style={{paddingLeft:25,paddingTop:15}}>
         <Text style={styles.cusHead}>{item.customer}</Text>
         <Text style={{color:'red',fontSize:20,paddingBottom:7}}>Rs.{item.collected_amount}/-</Text>
         <Text style={styles.cusText}>{item.street}</Text>
        </View>
        </View>
  );
};

//Collection List Component
export default function CollectionList() {
  var date = moment().utcOffset("+05:30").format("DD-MM-YYYY");
  const { height } = Dimensions.get("window");
  //Auth context
  const authContext = useContext(AuthContext);
  const { token } = authContext;

  //Collection States
  const [collectionlist, setCollectionList] = useState("");
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  const [sc, setSC] = useState(false);

  //Mounting

  const [isLoading, setIsLoading] = useState(true);

  //Refresh control
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshData, setrefreshData] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setrefreshData(true);

    wait(2000).then(() => setRefreshing(false));
  }, [refreshing]);

  const showToast = (res) => {
    ToastAndroid.showWithGravityAndOffset(
      res,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      200
    );
  };

   //Getiing Customers List
   async function getCollectedList() {
    try {
      await fetch(url+"api/collectedcustomers?agent=true&limit=70", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Token " + token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data[0])
          if(data[0] != "No Records Found"){
            setCollectionList(data);
           setCount(data.length);
           let total_amt = 0
          data.forEach(element => {
            total_amt +=element.collected_amount
            
          });
          setTotal(total_amt)
          }else{
            showToast("No Records Found")
          }
          
        });
    } catch (error) {
      showToast(error.message);
    }
  }


  //On Component Mount
  useEffect(() =>{
    getCollectedList();

  },[])

  //useHooks for async loading of data
  useEffect(() => {
    //submiting Collection
    async function submitCollection() {
      try {
        let response = await fetch(url+"api/collectionreports/", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Token " + token,
          },
        });
          let res = response.json()
          if(response.ok){
            showToast('Collection Submitted Successfully')
          }else{
            showToast("Collection Already Submitted")
          }
      } catch (error) {
        showToast(error.message)
      }
    }

    // //Getting Total Collection
    // async function getTotalCollection() {
    //   try {
    //     await fetch(url+"api/totalcollection", {
    //       method: "GET",
    //       headers: {
    //         Accept: "application/json",
    //         "Content-Type": "application/json",
    //         Authorization: "Token " + token,
    //       },
    //     })
    //       .then((res) => res.json())
    //       .then((data) => {
    //         setTotal(data["total_collection"]);
    //       });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }

    //When Payment Collected and Refreshing
    if (refreshData) {
      getCollectedList();

    }

    setrefreshData(false);

    //When submit collection
    if (sc) {
      submitCollection();
    }

    setSC(false);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

  }, [sc, refreshData]);

  //List Header
  const renderHeader = () => (
    <View style={styles.headerL}>
      <View style={styles.header}>
        <Text style={styles.count}>
          Collected : <Text style={styles.countValue}>{count}</Text>
        </Text>
        <Text style={styles.date}>
          Date : <Text style={styles.countValue}>{date}</Text>
        </Text>
      </View>
      <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 15 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#00bf8f",
            width: 200,
            height: 50,
            padding: 10,
            borderRadius: 20,
          }}
          onPress={() => {
            setSC(true);
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Submit Collection
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        style={{
          fontSize: 22,
          color: "black",
          fontWeight: "bold",
          paddingLeft: 5,
        }}
      >
        Total Collection : <Text style={styles.countValue}>{total}</Text>
      </Text>
    </View>
  );

  //End List Header

  return (
    <View style={styles.container}>
      {isLoading  ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Please wait...</Text>
        </View>
      ) : (
        <OptimizedFlatList
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          data={collectionlist}
          renderItem={RenderItem}
          ListHeaderComponent={renderHeader}
          keyExtractor={(item,index) => item.id != null ?(item.id).toString():null}
          nestedScrollEnabled={false}
          removeClippedSubviews={true}
          
          ListFooterComponent={
            <View style={{ height: 0, marginBottom: 20 }}></View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    alignItems: "center",
    backgroundColor: "#eeff",
    marginBottom: 25,
    paddingBottom: 25,
    height: "100%",
    
  },
  headerL:{
    padding: 15,
    width:Dimensions.get('window').width,
    justifyContent: "space-around",
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#ddd",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    marginLeft: 1,
    marginRight: 1,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: "#fff",

  },
  clist: {
    marginTop: 20,
    fontSize: 25,
    color: "#fff",
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
  clistContainer: {
    flexDirection:'row',
    padding: 10,
    justifyContent: 'flex-start',
    alignItems:'center',
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#ddd",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: "#fff",
  },
  clText: {
    fontSize: 20,
    textDecorationStyle: "solid",
  },
  count: {
    fontSize: 22,
    color: "black",
    fontWeight: "bold",
    paddingRight:20,
  },
  date: {
    fontSize: 22,
    color: "black",
    fontWeight: "bold",
  },
  header: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  countValue: {
    fontSize: 22,
    color: "red",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  itemvalue: {
    color: "black",
    fontSize: 17,
  },
  itemname: {
    fontSize: 18,
    color: "#4A00E0",
    fontWeight: "bold",
  },
  amt: {
    fontSize: 19,
    color: "red",
    fontWeight: "bold",
  },
  cusHead: {
    color: "#8e2de2",
    fontSize: 20,
    fontWeight: "bold",
    width: 240,
    paddingBottom:7
  },
  cusText: {
    fontSize: 20,
    color:'black',
    width:300,
    paddingBottom:1
    
  },
});
