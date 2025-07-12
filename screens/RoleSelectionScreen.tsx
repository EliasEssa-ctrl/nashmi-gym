import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  KeyboardAvoidingView, ScrollView, Platform, Alert
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RoleSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('هذا الحساب غير موجود في قاعدة البيانات');
        return;
      }

      const userData = docSnap.data();
      const role = userData.role;

      if (role === 'coach') {
        navigation.replace('PlayerPlans'); // ✅ التوجيه إلى PlayerPlans للمدرب
      } else {
        navigation.navigate('Player', { username: userData.name || email }); // ✅ اللاعب كما هو
      }

    } catch (e: any) {
      setError('فشل في تسجيل الدخول: ' + e.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('تم الإرسال', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    } catch (e: any) {
      Alert.alert('خطأ', 'تعذر إرسال رابط إعادة التعيين: ' + e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#121212' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginTop: 0 }]}
            placeholder="كلمة المرور"
            placeholderTextColor="#ccc"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showButton}>
            <Text style={{ color: '#FFD700', fontSize: 12 }}>
              {showPassword ? 'إخفاء' : 'إظهار'}
            </Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.link}>نسيت كلمة المرور؟</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>إنشاء حساب جديد</Text>
        </TouchableOpacity>
       <View style={styles.guestButtonsContainer}>
  <TouchableOpacity
    style={styles.guestButton}
    onPress={() => navigation.navigate('Player', { username: 'qotibah' })}
  >
    <Text style={styles.guestButtonText}>الدخول كـ لاعب</Text>
  </TouchableOpacity>

   <TouchableOpacity
    style={styles.guestButton}
    onPress={() => navigation.navigate('Coach', { selectedPlayer: ' '  })}
  ><Text style={styles.guestButtonText}> الدخول كمدرب </Text>
  </TouchableOpacity>

</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
 guestButtonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '90%',
  marginTop: 20,
},

guestButton: {
  backgroundColor: '#FFD700',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  flex: 1,
  marginHorizontal: 5,
  alignItems: 'center',
},

guestButtonText: {
  color: '#000',
  fontWeight: 'bold',
  fontSize: 14,
},


  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  input: {
    width: '90%',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginTop: 10,
  },
  showButton: {
    paddingHorizontal: 12,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#FFD700',
    padding: 14,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#FFD700',
    marginTop: 10,
  },
});
