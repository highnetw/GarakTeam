import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  FlatList,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export default function EditMeetingScreen({ onNavigate, meeting }) {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(meeting);
  const [date, setDate] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [cost, setCost] = useState('');
  const [attendees, setAttendees] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    if (selectedMeeting) {
      setDate(selectedMeeting.date);
      setRestaurant(selectedMeeting.restaurant);
      setCost(selectedMeeting.cost.toString());
      setAttendees(selectedMeeting.attendees.toString());
      setImageUri(selectedMeeting.imageUri);
      setEditMode(true);
    }
  }, [selectedMeeting]);

  const loadMeetings = async () => {
    try {
      const snapshot = await firestore()
        .collection('meetings')
        .orderBy('date', 'desc')
        .get();

      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMeetings(meetingsData);
    } catch (error) {
      console.error('데이터 불러오기 오류:', error);
    }
  };

  const selectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageToStorage = async (uri) => {
    if (!uri) return '';
    
    try {
      const filename = `meetings/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const reference = storage().ref(filename);
      
      await reference.putFile(uri);
      const downloadURL = await reference.getDownloadURL();
      
      return downloadURL;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw error;
    }
  };

  const updateMeeting = async () => {
    if (!date || !restaurant || !cost || !attendees) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }

    setUploading(true);

    try {
      let uploadedImageUrl = imageUri;
      
      // 이미지가 로컬 파일이면 업로드
      if (imageUri && imageUri.startsWith('file://')) {
        uploadedImageUrl = await uploadImageToStorage(imageUri);
      }

      await firestore()
        .collection('meetings')
        .doc(selectedMeeting.id)
        .update({
          date,
          restaurant,
          cost: parseFloat(cost),
          attendees: parseInt(attendees),
          imageUri: uploadedImageUrl || '',
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      setUploading(false);

      Alert.alert('성공', '모임 정보가 수정되었습니다.', [
        { text: '확인', onPress: () => {
          loadMeetings();
          setEditMode(false);
          setSelectedMeeting(null);
        }}
      ]);
    } catch (error) {
      setUploading(false);
      console.error('수정 오류:', error);
      Alert.alert('오류', '모임 정보 수정에 실패했습니다.');
    }
  };

  const deleteMeeting = () => {
    Alert.alert(
      '삭제 확인',
      '이 모임을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore()
                .collection('meetings')
                .doc(selectedMeeting.id)
                .delete();

              Alert.alert('성공', '모임이 삭제되었습니다.', [
                { text: '확인', onPress: () => {
                  loadMeetings();
                  setEditMode(false);
                  setSelectedMeeting(null);
                }}
              ]);
            } catch (error) {
              console.error('삭제 오류:', error);
              Alert.alert('오류', '모임 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderMeetingCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        selectedMeeting?.id === item.id && styles.selectedCard
      ]}
      onPress={() => selectMeeting(item)}
    >
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.restaurant}>{item.restaurant}</Text>
    </TouchableOpacity>
  );

  if (!editMode) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>수정할 모임 선택</Text>

        <FlatList
          data={meetings}
          renderItem={renderMeetingCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>저장된 모임이 없습니다.</Text>
          }
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={styles.backButtonText}>홈으로</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>모임 정보 수정</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>날짜</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>식당 이름</Text>
        <TextInput
          style={styles.input}
          value={restaurant}
          onChangeText={setRestaurant}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>총 비용 (원)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={cost}
          onChangeText={setCost}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>참석 인원</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={attendees}
          onChangeText={setAttendees}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>더치페이 이미지</Text>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>갤러리에서 선택</Text>
        </TouchableOpacity>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.updateButton, uploading && styles.disabledButton]} 
          onPress={updateMeeting}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>수정 완료</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.deleteButton, uploading && styles.disabledButton]} 
          onPress={deleteMeeting}
          disabled={uploading}
        >
          <Text style={styles.deleteButtonText}>삭제하기</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          setEditMode(false);
          setSelectedMeeting(null);
        }}
      >
        <Text style={styles.cancelButtonText}>취소</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    margin: 5,
    padding: 15,
    borderRadius: 10,
    minHeight: 100,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  restaurant: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 50,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  imageButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
