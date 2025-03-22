import { router, Stack, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useCallback, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';



type UserType={id: number; name: string; email:string}



export default function TabHome() {
  const [data, setData]=useState<UserType[]>([]);
  const database = useSQLiteContext();


  const loadData = async () =>{
    const result = await database.getAllAsync<UserType>("SELECT * FROM users;");
    setData(result);
  };
  const handleDelete = async (id: number) =>{
    try{
      await database.runAsync("DELETE FROM users WHERE id =?;", [id]);
      loadData();
    }catch(error){
      console.error(error);
    }
  }
  useFocusEffect(
    useCallback( ()=>{
      loadData();
    }, [])
  );

  /**
   * displays button on the right side of the header
   */
  const headerRight=() =>{
    return(
      <TouchableOpacity onPress={()=> router.push("/modal")}
      style={{marginRight: 10}}
      >
        <FontAwesome name="plus-circle" size={28} color="blue"/>

      </TouchableOpacity>
      

    );
  };
 return (
   <View style={styles.container}>
     <Stack.Screen options={{headerRight}}/>
     <View>
       <FlatList data={ data} renderItem={({item})=>{
        return(
         <View style={{padding:10}}>
           <View style={{flexDirection:"row", justifyContent: "space-between"}}>
             <View style={{
              justifyContent: "flex-start", gap: 10,
             }}>
               <Text>{item.name}</Text>
               <Text>{item.email}</Text>
             </View>
             <View style={{
              flex: 1, flexDirection:"row", justifyContent: "flex-end", gap: 10,
             }}>
              <TouchableOpacity onPress={()=>{
              router.push('/modal?id=${item.id}');
             }} 
             style={styles.button}
             >
              <Text style={styles.buttonText}>Edit</Text>

             </TouchableOpacity>

             <TouchableOpacity onPress={()=>{
              handleDelete(item.id);
              }} 
             style={[styles.button, { backgroundColor: "red"}]}
             >
              <Text style={styles.buttonText}>Delete</Text>

             </TouchableOpacity>
             </View>
           </View>
          </View>
          

        );
        }}/>
     </View>
   </View>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  button:{
    backgroundColor: "blue",
    padding:5,
    borderRadius:5,
    height:30,
    

  },
  buttonText:{
    color:"white",
    fontWeight:"bold",
    fontSize:12,

  }
});
