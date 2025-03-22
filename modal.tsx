import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export default function Modal() {
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editMode, setEditMode] = useState(false);
  const database = useSQLiteContext();


  //chack for edit mode
  useEffect(()=> {
    if(id){
      setEditMode(true);
      loadData();
    }
  }, [id]);

  //load data for edit mode
  const loadData = async () =>{
    const result = await database.getFirstAsync<{name: string; email: string}>(
      "SELECT name, email FROM users WHERE id = ?;",
      [parseInt(id as string)]
    );
    setName(result.name);
    setEmail(result.email);
  };

  const handleSave = async () => {
   
      try {
        // Insert user data into the database
        await database.runAsync("INSERT INTO users (name, email) VALUES (?, ?);", [name, email]);
        router.back(); // Go back to the previous screen
      } catch (error) {
        console.error( error);
      }finally{
        setName("");
        setEmail("");
      }
    
  };

  const handleUpdate = async (): Promise<void> => {
    try {
      // Ensure id is a number
      const userId = parseInt(id as string, 10);
  
      // Run the update query
      const response = await database.runAsync(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, userId]
      );
  
      // Log the success
      console.log("Item updated successfully:", response?.changes);
  
      // Navigate back (or handle UI transition as needed)
      router.back();
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      // Reset state only if the update was successful (optional based on your needs)
      
        setName("");
        setEmail("");
      
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Item Modal' }} />
      
      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={(text) => setName(text)}
          style={styles.textInput}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.textInput}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.back()} // Go back without saving
          style={[styles.button, { backgroundColor: 'red' }]}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {editMode ? handleUpdate() : handleSave()}} // Call handleSave to save data
          style={[styles.button, { backgroundColor: 'blue' }]}
          disabled={!name || !email} // Disable Save if fields are empty
        >
          <Text style={styles.buttonText}>{editMode ? "Update" : "Save"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  textInput: {
    height: 50,
    width: 250,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10, // Rounded corners for the input box
    paddingLeft: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa', // Subtle background for input
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,  // Rounded corners for the buttons
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    height: 50,  // Ensures buttons are large enough
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
