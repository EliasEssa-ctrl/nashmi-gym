import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { db } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// العضلات وتمارينها
const musclesData: Record<string, string[]> = {
  صدر: ['بنش مستوي', 'بنش مائل', 'بنش مقلوب', 'تفتيح مستوي', 'تفتيح مائل', 'كابل عالي', 'كابل منخفض', 'دمبل مستوي', 'دمبل مائل', 'بنش آلة', 'ضغط أرضي', 'غطس', 'بوش أب', 'بنش سميث', 'تفتيح سميث', 'سحب علوي', 'ضغط مقبض', 'بنش واسع', 'بنش ضيق', 'بنش توقف'],
  ظهر: ['سحب أمامي', 'سحب خلفي', 'بار أرضي', 'دامبل فردي', 'دامبل مزدوج', 'تي بار', 'بلوفر', 'هايمبول', 'سحب علوي واسع', 'سحب سفلي', 'سحب ضيق', 'سحب جانبي', 'رفرفة ظهر', 'آلة ظهر', 'رفرفة سميث', 'هاك ظهر', 'رفع ترابيس', 'كابل ظهر', 'دمبل ظهر', 'بول أب'],
  أرجل: ['سكوات', 'سكوات أمامي', 'بريس أرجل', 'لانجز', 'رفرفة أمامية', 'رفرفة خلفية', 'رفرفة جانبية', 'سمانة واقف', 'سمانة جالس', 'سمانة آلة', 'مشية لانجز', 'دمبل أرجل', 'بار أرجل', 'كابل أرجل', 'ضغط أرجل', 'سميث سكوات', 'رفرفة دمبل', 'رفع سمانة', 'جسر أرداف', 'ستيف ديدلفت'],
  أكتاف: ['ضغط أمامي', 'ضغط خلفي', 'رفرفة جانبية', 'رفرفة أمامية', 'رفرفة خلفية', 'بار أمامي', 'بار خلفي', 'دمبل جانبي', 'دمبل خلفي', 'دمبل أمامي', 'كابل جانبي', 'كابل خلفي', 'كابل أمامي', 'آلة أكتاف', 'سميث أكتاف', 'سحب دمبل', 'سحب بار', 'كروس أكتاف', 'ضغط أرنولد', 'شرايح أمامية'],
  بايسبس: ['بار مستقيم', 'بار Z', 'دمبل بالتبادل', 'دمبل معكوس', 'كابل بايسبس', 'جهاز بايسبس', 'تركيز بايسبس', 'كروس بايسبس', 'بار على مقعد', 'سميث بايسبس', 'همر', 'بار مفتوح', 'دمبل دوران', 'سحب عكسي', 'بايسبس مزدوج', 'دمبل على مقعد', 'بار خفيف', 'بار ثقيل', 'رفرفة بايسبس', 'آلة بايسبس'],
  ترايسبس: ['بار ضيق', 'دمبل خلف الرأس', 'كابل سفلي', 'كابل علوي', 'كروس تراي', 'جهاز ترايسبس', 'غطس ترايسبس', 'بوش أب ضيق', 'سميث ترايسبس', 'رفرفة ترايسبس', 'مطرقة تراي', 'كابل عكسي', 'دمبل تمديد', 'كابل مزدوج', 'بار معكوس', 'ضغط خلفي', 'بار تراي', 'دمبل تراي واقف', 'آلة تراي', 'هامر تراي'],
  معدة: ['كورنش عادي', 'كورنش مع دوران', 'رفع أرجل', 'بلانك', 'بلانك جانبي', 'عجلة معدة', 'كابل معدة', 'جهاز معدة', 'بار معدة', 'سكوات معدة', 'جسر معدة', 'رفع أرجل معلق', 'بلانك طويل', 'تمدد معدة', 'كورنش سميث', 'ضغط معدة', 'كروس معدة', 'انحناء معدة', 'رفرفة معدة', 'كورنش بالكابل']
};

export default function CoachScreen() {
  const [playerName, setPlayerName] = useState('');
  const [split, setSplit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Record<string, string[]>>({});

  const toggleExercise = (muscle: string, exercise: string) => {
    setSelectedExercises(prev => {
      const current = prev[muscle] || [];
      return {
        ...prev,
        [muscle]: current.includes(exercise)
          ? current.filter(e => e !== exercise)
          : [...current, exercise],
      };
    });
  };

  const handleSave = async () => {
    if (!playerName || !split || !startDate || !endDate) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول');
      return;
    }

    const exercisesArray = Object.keys(selectedExercises).map(muscle => ({
      muscle,
      selected: selectedExercises[muscle],
    }));

    try {
      await addDoc(collection(db, 'workouts'), {
        playerName,
        split,
        startDate,
        endDate,
        exercises: exercisesArray,
      });
      Alert.alert('✅ تم الحفظ', 'تم حفظ التمارين بنجاح');
      setPlayerName('');
      setSplit('');
      setStartDate('');
      setEndDate('');
      setSelectedExercises({});
    } catch (e) {
      Alert.alert('❌ خطأ', 'فشل في الحفظ');
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📋 إعداد خطة تمرين</Text>

      <TextInput style={styles.input} placeholder="اسم اللاعب" value={playerName} onChangeText={setPlayerName} />
      <TextInput style={styles.input} placeholder="التقسيمة (مثلاً: Push/Pull/Legs)" value={split} onChangeText={setSplit} />
      <TextInput style={styles.input} placeholder="تاريخ البداية" value={startDate} onChangeText={setStartDate} />
      <TextInput style={styles.input} placeholder="تاريخ النهاية" value={endDate} onChangeText={setEndDate} />

      {Object.keys(musclesData).map(muscle => (
        <View key={muscle} style={styles.section}>
          <Text style={styles.muscleTitle}>💪 {muscle}</Text>
          <View style={styles.exerciseList}>
            {musclesData[muscle].map(ex => (
              <TouchableOpacity
                key={ex}
                style={[
                  styles.exerciseItem,
                  selectedExercises[muscle]?.includes(ex) && styles.selectedExercise
                ]}
                onPress={() => toggleExercise(muscle, ex)}
              >
                <Text style={styles.exerciseText}>{ex}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>💾 حفظ الخطة</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  title: { fontSize: 22, color: '#fff', marginBottom: 12, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    
    
    
  },
  section: { marginBottom: 20 },
  muscleTitle: { color: '#4CAF50', fontSize: 18, marginBottom: 6 },
  exerciseList: { flexDirection: 'row', flexWrap: 'wrap' },
  exerciseItem: {
    backgroundColor: '#2e2e2e',
    padding: 8,
    borderRadius: 8,
    margin: 4,
  },
  selectedExercise: { backgroundColor: '#4CAF50' },
  exerciseText: { color: '#fff' },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
    
  },
  buttonText: { color: '#fff', fontSize: 18 },
});
