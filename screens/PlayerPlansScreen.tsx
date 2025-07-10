import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerPlans'>;

interface Workout {
  startDate: string;
  endDate: string;
  duration: number;
  workoutPlan: Record<string, Record<string, string[]>>;
  id?: string; // Document ID for updates/deletes
}

export default function PlayerPlansScreen() {
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [plans, setPlans] = useState<Workout[]>([]);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchPlayers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const names = usersSnapshot.docs
        .filter(doc => doc.data().role !== 'coach')
        .map(doc => doc.data().name);
      setPlayers(names);
    };
    fetchPlayers();
  }, []);

  const fetchPlayerPlans = async (playerName: string) => {
    const snapshot = await getDocs(collection(db, 'workouts'));
    const playerPlans = snapshot.docs
      .filter(doc => doc.data().playerName === playerName)
      .map(doc => ({ id: doc.id, ...doc.data() } as Workout));
    setPlans(playerPlans);
    setSelectedPlayer(playerName);
  };

  const handleEditPlayer = (playerName: string) => {
    navigation.navigate('Coach', { selectedPlayer: playerName });
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteDoc(doc(db, 'workouts', planId));
      Alert.alert('تم الحذف', 'تم حذف الخطة بنجاح');
      if (selectedPlayer) fetchPlayerPlans(selectedPlayer);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
    }
  };

  const renderDay = (plan: Workout, day: string) => {
    const muscles = plan.workoutPlan[day];
    return (
      <View key={day}>
        <Text style={styles.dayText}>📅 {day}  📅</Text>
        {muscles ? (
          Object.entries(muscles).map(([muscle, exercises]) => (
            <View key={muscle}>
              <Text style={styles.muscleText}>💪 {muscle}</Text>
              <View style={styles.exerciseRow}>
                {exercises.map((ex, idx) => (
                  <Text key={idx} style={styles.exerciseText}>
                    {idx + 1}. {ex}
                  </Text>
                ))}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.restText}>راحة 💤</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>📋 خطط تمارين اللاعبين</Text>

      {selectedPlayer ? (
        <>
          <TouchableOpacity onPress={() => setSelectedPlayer(null)}>
            <Text style={styles.backButton}>⬅ العودة للقائمة</Text>
          </TouchableOpacity>

          <Text style={styles.subTitle}>📌 الخطط الخاصة بـ {selectedPlayer}</Text>

          <TouchableOpacity style={styles.editButton} onPress={() => handleEditPlayer(selectedPlayer)}>
            <Text style={styles.editText}>✏️ تعديل خطة اللاعب</Text>
          </TouchableOpacity>

          {plans.length === 0 ? (
            <Text style={{ color: '#ccc', textAlign: 'center', marginTop: 10 }}>
              لا توجد خطة تمارين لهذا اللاعب بعد.
            </Text>
          ) : (
            plans.map((plan, index) => {
              const today = new Date();
              const end = new Date(plan.endDate);
              const remaining = Math.max(0, Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
              const expired = remaining === 0;

              return (
                <View
                  key={index}
                  style={[styles.planCard, expired && { borderColor: 'red', borderWidth: 2 }]}
                >
                  <Text style={styles.planDate}>
                    من {plan.startDate} إلى {plan.endDate} ({plan.duration} يوم)
                  </Text>
                  <Text style={{ color: expired ? 'red' : '#FFD700', marginBottom: 8 }}>
                    {expired ? '⛔ انتهى الاشتراك' : `⏳ المتبقي: ${remaining} يوم`}
                  </Text>

                  {renderDay(plan, 'الأحد')}
                  {renderDay(plan, 'الاثنين')}
                  {renderDay(plan, 'الثلاثاء')}
                  {renderDay(plan, 'الأربعاء')}
                  {renderDay(plan, 'الخميس')}
                  {renderDay(plan, 'الجمعة')}
                  {renderDay(plan, 'السبت')}

                  <TouchableOpacity
                    style={[styles.editButton, { marginTop: 10, backgroundColor: '#e53935' }]}
                    onPress={() => handleDeletePlan(plan.id!)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>🗑️ حذف الخطة</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </>
      ) : (
        players.map((name, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.playerButton}
            onPress={() => fetchPlayerPlans(name)}
          >
            <Text style={styles.playerText}> {idx + 1}</Text>
            <Text style={styles.playerText}> {name}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  logo: { width: 130, height: 130, resizeMode: 'contain', alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 22, color: '#FFD700', textAlign: 'center', marginBottom: 10 },
  backButton: { color: '#FFD700', marginBottom: 10, fontSize: 16 },
  subTitle: { fontSize: 18, color: '#fff', marginBottom: 10 },
  playerButton: { backgroundColor: '#FFD700', padding: 12, borderRadius: 10, marginVertical: 6 },
  playerText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  planCard: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10
  },
  planDate: { color: '#FFD700', marginBottom: 8, fontWeight: 'bold' },
  dayText: { color: '#fff', marginTop: 10, fontSize: 16 },
  muscleText: { color: '#ccc', marginLeft: 10, marginTop: 4 },
  exerciseRow: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 16 },
  exerciseText: {
    color: '#aaa',
    backgroundColor: '#2e2e2e',
    margin: 3,
    padding: 6,
    borderRadius: 8,
    fontSize: 13
  },
  restText: { color: '#999', marginLeft: 16, marginTop: 4, fontStyle: 'italic' },
  editButton: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  editText: { color: '#000', fontWeight: 'bold' }
});
