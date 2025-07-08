import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// تعريف نوع بيانات التوجيه
type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;

// شكل بيانات التمرين
interface WorkoutEntry {
  playerName: string;
  split: string;
  startDate: string;
  endDate: string;
  exercises: {
    muscle: string;
    selected: string[];
  }[];
}

export default function PlayerScreen() {
  const route = useRoute<PlayerRouteProp>();
  const { username } = route.params;

  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'workouts'));
        const data = snapshot.docs.map(doc => doc.data() as WorkoutEntry);

        // فلترة البيانات حسب اسم اللاعب فقط
        const myData = data.filter(entry =>
          entry.playerName.trim().toLowerCase() === username.trim().toLowerCase()
        );

        setWorkouts(myData);
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>مرحبًا يا {username} 💪</Text>
      {workouts.length === 0 ? (
        <Text style={styles.noData}>لا يوجد تمارين محفوظة حتى الآن.</Text>
      ) : (
        workouts.map((entry, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>🧩 التقسيمة: {entry.split}</Text>
            <Text style={styles.cardText}>📅 من {entry.startDate} إلى {entry.endDate}</Text>
            <Text style={styles.cardSubTitle}>📌 التمارين:</Text>
            {entry.exercises.map((e, i) => (
              <Text key={i} style={styles.cardText}>- {e.muscle}: {e.selected.join(', ')}</Text>
            ))}
          </View>
        ))
      )}
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
  cardSubTitle: {
    color: '#ccc',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  cardText: {
    color: '#fff',
    marginBottom: 4,
  },
});
