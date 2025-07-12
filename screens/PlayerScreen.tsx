import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface WorkoutEntry {
  playerName: string;
  startDate: string;
  endDate: string;
  duration: number;
  workoutPlan: Record<string, Record<string, { name: string; done: boolean }[]>>;
}

interface DayEntry {
  day: string;
  muscles: Record<string, { name: string; done: boolean }[]>;
}

export default function PlayerScreen() {
  const route = useRoute<PlayerRouteProp>();
  const { username } = route.params;
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<WorkoutEntry | null>(null);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'workouts'));
        const allWorkouts = snapshot.docs.map(doc => doc.data() as Omit<WorkoutEntry, 'workoutPlan'> & {
          workoutPlan: Record<string, Record<string, string[]>>;
        });
        const myWorkout = allWorkouts.find(
          entry => entry.playerName.trim().toLowerCase() === username.trim().toLowerCase()
        );

        if (myWorkout) {
          const transformedWorkoutPlan: WorkoutEntry['workoutPlan'] = {};
          Object.entries(myWorkout.workoutPlan).forEach(([day, muscles]) => {
            transformedWorkoutPlan[day] = {};
            Object.entries(muscles).forEach(([muscle, exercises]) => {
              transformedWorkoutPlan[day][muscle] = exercises.map(name => ({ name, done: false }));
            });
          });

          setWorkout({
            playerName: myWorkout.playerName,
            startDate: myWorkout.startDate,
            endDate: myWorkout.endDate,
            duration: myWorkout.duration,
            workoutPlan: transformedWorkoutPlan,
          });
        } else {
          setWorkout(null);
        }
      } catch (error) {
        console.error('حدث خطأ أثناء جلب التمارين:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const toggleExercise = (day: string, muscle: string, index: number) => {
    if (!workout) return;

    const updated = { ...workout };
    updated.workoutPlan[day][muscle][index].done = !updated.workoutPlan[day][muscle][index].done;
    setWorkout({ ...updated });
  };

  const getProgress = () => {
    if (!workout) return 0;
    let total = 0;
    let completed = 0;

    Object.values(workout.workoutPlan).forEach(muscles => {
      Object.values(muscles).forEach(exList => {
        total += exList.length;
        completed += exList.filter(ex => ex.done).length;
      });
    });

    return total === 0 ? 0 : completed / total;
  };

  const renderExercise = ({ item, index }: { item: { name: string; done: boolean }, index: number }, day: string, muscle: string) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => toggleExercise(day, muscle, index)}
    >
      <Text
        style={[
          styles.exerciseText,
          {
            textDecorationLine: item.done ? 'line-through' : 'none',
            color: item.done ? '#999' : '#fff',
          },
        ]}
      >
        {item.done ? '✅' : '🔲'} {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMuscle = ({ item }: { item: { muscle: string; exercises: { name: string; done: boolean }[] } }, day: string) => (
    <View style={styles.muscleSection}>
      <Text style={styles.muscleText}>💪 {item.muscle}</Text>
      <FlatList
        data={item.exercises}
        renderItem={({ item, index }) => renderExercise({ item, index }, day, item.muscle)}
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.exerciseSeparator} />}
      />
    </View>
  );

  const renderDay = ({ item }: { item: DayEntry }) => (
    <View style={styles.section}>
      <Text style={styles.dayHeader}>📅 {item.day}</Text>
      <FlatList
        data={Object.entries(item.muscles).map(([muscle, exercises]) => ({ muscle, exercises }))}
        renderItem={({ item }) => renderMuscle({ item }, item.day)}
        keyExtractor={item => item.muscle}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.muscleSeparator} />}
      />
    </View>
  );

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

  const daysData: DayEntry[] = Object.entries(workout.workoutPlan).map(([day, muscles]) => ({
    day,
    muscles,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مرحبًا يا {username} 💪</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          نسبة الإنجاز: {Math.round(getProgress() * 100)}%
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getProgress() * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          📅 من {workout.startDate} إلى {workout.endDate}
        </Text>
        <Text style={styles.cardText}>⏳ المدة: {workout.duration} يوم</Text>
        <Text style={styles.cardSubTitle}>📌 التمارين:</Text>

        <FlatList
          data={daysData}
          renderItem={renderDay}
          keyExtractor={item => item.day}
          contentContainerStyle={styles.daysList}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        }
      >
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  daysList: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    color: '#FFD700',
    marginVertical: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noData: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#444',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  cardSubTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  section: {
    marginVertical: 10,
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
  },
  dayHeader: {
    color: '#FFD700',
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  muscleSection: {
    marginBottom: 12,
  },
  muscleText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    paddingLeft: 10,
  },
  exerciseItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#333',
    borderRadius: 6,
    marginVertical: 4,
  },
  exerciseText: {
    color: '#fff',
    fontSize: 14,
  },
  exerciseSeparator: {
    height: 8,
  },
  muscleSeparator: {
    height: 12,
  },
  logoutButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  logoutText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});