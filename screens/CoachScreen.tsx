import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, BackHandler
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { db } from '../config/firebaseConfig';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { muscleExercises } from '../data/detailedExercises';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

type CoachRouteProp = RouteProp<RootStackParamList, 'Coach'>;

export default function CoachScreen() {
  const route = useRoute<CoachRouteProp>();
  const navigation = useNavigation();

  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [expandedDay, setExpandedDay] = useState('');
  const [expandedMuscle, setExpandedMuscle] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState<Record<string, Record<string, string[]>>>({});

  useEffect(() => {
    const fetchPlayers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const playerNames = snapshot.docs
        .map(doc => doc.data())
        .filter(user => user.role !== 'coach')
        .map(user => user.name);
      setPlayers(playerNames);
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (route.params?.selectedPlayer) setSelectedPlayer(route.params.selectedPlayer);
  }, [route.params]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.replace('PlayerPlans');
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove(); // ✅ استخدام الطريقة الصحيحة
    }, [])
  );

  const toggleDay = (day: string) => {
    setExpandedDay(prev => (prev === day ? '' : day));
    setExpandedMuscle('');
  };

  const toggleMuscle = (muscle: string) => {
    setExpandedMuscle(prev => (prev === muscle ? '' : muscle));
  };

  const toggleExercise = (day: string, muscle: string, exercise: string) => {
    setWorkoutPlan(prev => {
      const dayPlan = prev[day] || {};
      const exercises = dayPlan[muscle] || [];
      const updated = exercises.includes(exercise)
        ? exercises.filter(e => e !== exercise)
        : [...exercises, exercise];
      return { ...prev, [day]: { ...dayPlan, [muscle]: updated } };
    });
  };

  const getDuration = () => {
    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleSave = async () => {
    if (!selectedPlayer) return Alert.alert('خطأ', 'يرجى اختيار اللاعب');
    try {
      await addDoc(collection(db, 'workouts'), {
        playerName: selectedPlayer,
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
        duration: getDuration(),
        workoutPlan
      });
      Alert.alert('✅ تم الحفظ', 'تم حفظ خطة التمارين بنجاح');
    } catch (e) {
      Alert.alert('❌ خطأ', 'فشل في الحفظ');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>📋 إعداد خطة تمرين</Text>

      <Text style={styles.label}>اختر اللاعب:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedPlayer} onValueChange={setSelectedPlayer} style={styles.picker}>
          <Picker.Item label="-- اختر --" value="" />
          {players.map((name, idx) => (
            <Picker.Item key={idx} label={name} value={name} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>تاريخ البداية:</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
        <Text style={styles.buttonText}>{startDate.toDateString()}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(e, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      <Text style={styles.label}>تاريخ النهاية:</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
        <Text style={styles.buttonText}>{endDate.toDateString()}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          minimumDate={startDate}
          onChange={(e, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      <Text style={styles.label}>مدة الاشتراك: {getDuration()} يوم</Text>

      {/* زر الحفظ تم وضعه هنا لرفعه لأعلى */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>💾 حفظ الخطة</Text>
      </TouchableOpacity>

      <Text style={styles.label}>🗓️ أيام التدريب:</Text>

      {daysOfWeek.map(day => (
        <View key={day}>
          <TouchableOpacity onPress={() => toggleDay(day)} style={styles.dayButton}>
            <Text style={styles.dayText}>📅 {day}</Text>
          </TouchableOpacity>
          {expandedDay === day &&
            Object.keys(muscleExercises).map(muscle => (
              <View key={muscle}>
                <TouchableOpacity onPress={() => toggleMuscle(muscle)} style={styles.muscleButton}>
                  <Text style={styles.muscleText}>💪 {muscle}</Text>
                </TouchableOpacity>
                {expandedMuscle === muscle && (
                  <View style={styles.exerciseContainer}>
                    {muscleExercises[muscle].map((exercise, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => toggleExercise(day, muscle, exercise)}
                        style={[
                          styles.exerciseItem,
                          workoutPlan[day]?.[muscle]?.includes(exercise) && styles.selected
                        ]}>
                        <Text style={styles.exerciseText}>{idx + 1}. {exercise}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
        </View>
      ))}

      <View style={{ marginBottom: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  logo: { width: 140, height: 140, alignSelf: 'center', marginBottom: 10, resizeMode: 'contain' },
  title: { fontSize: 22, color: '#FFD700', textAlign: 'center', marginBottom: 12 },
  label: { color: '#FFD700', fontSize: 16, marginTop: 10 },
  pickerContainer: { backgroundColor: '#1e1e1e', borderRadius: 8, marginBottom: 10 },
  picker: { color: '#fff' },
  dateButton: { backgroundColor: '#FFD700', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 8 },
  buttonText: { color: '#000', fontWeight: 'bold' },
  dayButton: { backgroundColor: '#333', padding: 10, borderRadius: 8, marginTop: 10 },
  dayText: { color: '#FFD700', fontSize: 16 },
  muscleButton: { backgroundColor: '#222', padding: 8, borderRadius: 6, marginTop: 6 },
  muscleText: { color: '#fff' },
  exerciseContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 4 },
  exerciseItem: {
    backgroundColor: '#2e2e2e',
    padding: 8,
    borderRadius: 6,
    margin: 4,
    width: '47%',
  },
  selected: { backgroundColor: '#FFD700' },
  exerciseText: { color: '#fff' },
  saveButton: {
    backgroundColor: '#FFD700', padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: 20
  },
  saveText: { color: '#000', fontSize: 18, fontWeight: 'bold' }
});
