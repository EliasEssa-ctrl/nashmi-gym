import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [coachCode, setCoachCode] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (!emailRegex.test(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    if (!passwordRegex.test(password)) {
      setError('كلمة المرور يجب أن تحتوي على حرف كبير، رقم، ورمز.');
      return;
    }

    if (!name.trim()) {
      setError('يرجى إدخال اسم المستخدم.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const role = coachCode === 'NASHMI2025COACH' ? 'coach' : 'player';

      await setDoc(doc(db, 'users', uid), {
        email,
        name,
        role,
        createdAt: serverTimestamp(),
      });

      alert(role === 'coach' ? 'تم تسجيل حساب المدرب بنجاح' : 'تم تسجيل الحساب بنجاح');
      navigation.goBack();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#121212' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>إنشاء حساب جديد</Text>

        <TextInput
          style={styles.input}
          placeholder="اسم المستخدم"
          placeholderTextColor="#ccc"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="كلمة المرور"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="كود المدرب (اختياري)"
          placeholderTextColor="#ccc"
          value={coachCode}
          onChangeText={setCoachCode}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>تسجيل</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>العودة لتسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFD700',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    marginVertical: 10,
  },
  errorText: {
    color: 'red',
    marginVertical: 5,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  link: {
    color: '#FFD700',
    marginTop: 20,
  },
});
