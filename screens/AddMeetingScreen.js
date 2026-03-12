import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export default function AddMeetingScreen({ onNavigate }) {
  const [date, setDate] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [cost, setCost] = useState('');
  const [attendees, setAttendees] = useState('');
  const [imageUris, setImageUris] = useState([]); // 배열로 변경
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (imageUris.length >= 5) {
      Alert.alert('알림', '이미지는 최대 5장까지 선택할 수 있습니다.');
      return;
    }

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
      setImageUris([...imageUris, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const newUris = imageUris.filter((_, i) => i !== index);
    setImageUris(newUris);
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

  const saveMeeting = async () => {
    if (!date || !restaurant || !cost || !attendees) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }

    setUploading(true);

    try {
      // 모든 이미지 업로드
      const uploadedUrls = await Promise.all(
        imageUris.map(uri => uploadImageToStorage(uri))
      );

      await firestore().collection('meetings').add({
        date,
        restaurant,
        cost: parseFloat(cost),
        attendees: parseInt(attendees),
        imageUris: uploadedUrls, // 배열로 저장
        imageUri: uploadedUrls[0] || '', // 기존 호환성 유지
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setUploading(false);

      Alert.alert('성공', '모임 정보가 저장되었습니다.', [
        { text: '확인', onPress: () => onNavigate('home') }
      ]);
    } catch (error) {
      setUploading(false);
      console.error('저장 오류:', error);
      Alert.alert('오류', '모임 정보 저장에 실패했습니다.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>새 모임 정보 입력</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>날짜</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-01-24"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>식당 이름</Text>
        <TextInput
          style={styles.input}
          placeholder="식당 이름을 입력하세요"
          value={restaurant}
          onChangeText={setRestaurant}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>총 비용 (원)</Text>
        <TextInput
          style={styles.input}
          placeholder="50000"
          keyboardType="numeric"
          value={cost}
          onChangeText={setCost}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>참석 인원</Text>
        <TextInput
          style={styles.input}
          placeholder="5"
          keyboardType="numeric"
          value={attendees}
          onChangeText={setAttendees}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          더치페이 이미지 ({imageUris.length}/5)
        </Text>
        
        {/* 이미지 미리보기 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
          {imageUris.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {imageUris.length < 5 && (
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>
              + 이미지 추가 ({imageUris.length}/5)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, uploading && styles.disabledButton]} 
          onPress={saveMeeting}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
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
    marginTop: 10,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageScrollView: {
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
