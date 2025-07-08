// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../navigation/AppNavigator';

// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// export default function LoginScreen() {
//   const navigation = useNavigation<NavigationProp>();

//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = () => {
//     if (username === 'coach' && password === '1234') {
//       navigation.navigate('Coach', { username });
//     } else if (username && password === '1234') {
//       navigation.navigate('Player', { username });
//     } else {
//       Alert.alert('فشل تسجيل الدخول', 'اسم المستخدم أو كلمة المرور غير صحيحة');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>نشمي جيم</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="اسم المستخدم"
//         placeholderTextColor="#aaa"
//         value={username}
//         onChangeText={setUsername}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="كلمة المرور"
//         placeholderTextColor="#aaa"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>تسجيل الدخول</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 20 },
//   title: { fontSize: 30, color: '#fff', marginBottom: 30, fontWeight: 'bold' },
//   input: { backgroundColor: '#1e1e1e', color: '#fff', width: '100%', padding: 12, borderRadius: 10, marginBottom: 15 },
//   button: { backgroundColor: '#4CAF50', padding: 15, width: '100%', borderRadius: 10, alignItems: 'center' },
//   buttonText: { color: '#fff', fontSize: 18 },
// });
