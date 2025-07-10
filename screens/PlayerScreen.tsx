import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;

interface WorkoutEntry {
  playerName: string;
  startDate: string;
  endDate: string;
  duration: number;
  workoutPlan: Record<string, Record<string, string[]>>;
}

export default function PlayerScreen() {
  const route = useRoute<PlayerRouteProp>();
  const { username } = route.params;

  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<WorkoutEntry | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'workouts'));
        const allWorkouts = snapshot.docs.map(doc => doc.data() as WorkoutEntry);

        const myWorkout = allWorkouts.find(
          entry => entry.playerName.trim().toLowerCase() === username.trim().toLowerCase()
        );

        setWorkout(myWorkout || null);
      } catch (error) {
        console.error('حدث خطأ أثناء جلب التمارين:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>مرحبًا يا {username} 💪</Text>
        <Text style={styles.noData}>لا يوجد تمارين محفوظة حتى الآن.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>مرحبًا يا {username} 💪</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>📅 من {workout.startDate} إلى {workout.endDate}</Text>
        <Text style={styles.cardText}>⏳ المدة: {workout.duration} يوم</Text>
        <Text style={styles.cardSubTitle}>📌 التمارين:</Text>

        {Object.entries(workout.workoutPlan).map(([day, muscles]) => (
          <View key={day} style={styles.section}>
            <Text style={styles.dayHeader}>📅 {day}</Text>
            {Object.entries(muscles).map(([muscle, exercises]) => (
              <View key={muscle} style={styles.muscleSection}>
                <Text style={styles.muscleText}>💪 {muscle}</Text>
                {exercises.map((ex, i) => (
                  <Text key={i} style={styles.exerciseText}>- {ex}</Text>
                ))}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 22,
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noData: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
  },
  cardSubTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  section: {
    marginTop: 10,
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
  },
  dayHeader: {
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  muscleSection: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  muscleText: {
    color: '#ccc',
    fontSize: 15,
    fontWeight: '600',
  },
  exerciseText: {
    color: '#fff',
    paddingLeft: 10,
    fontSize: 14,
  },
});
