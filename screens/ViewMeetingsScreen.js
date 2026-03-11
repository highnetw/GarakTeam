import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function ViewMeetingsScreen({ onNavigate }) {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('meetings')
      .orderBy('date', 'desc')
      .onSnapshot(
        (snapshot) => {
          const meetingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMeetings(meetingsData);
        },
        (error) => {
          console.error('데이터 불러오기 오류:', error);
        }
      );

    return () => unsubscribe();
  }, []);

  const showMeetingDetail = (meeting) => {
    setSelectedMeeting(meeting);
    setModalVisible(true);
  };

  const renderMeetingCard = ({ item }) => {
    const costPerPerson = item.attendees > 0 
      ? Math.round(item.cost / item.attendees) 
      : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => showMeetingDetail(item)}
      >
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.restaurant}>{item.restaurant}</Text>
        <Text style={styles.costPerPerson}>
          1인당: {costPerPerson.toLocaleString()}원
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>과거 모임 보기</Text>

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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedMeeting && (
              <>
                <Text style={styles.modalTitle}>모임 상세 정보</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>날짜:</Text>
                  <Text style={styles.detailValue}>{selectedMeeting.date}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>식당:</Text>
                  <Text style={styles.detailValue}>{selectedMeeting.restaurant}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>총 비용:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMeeting.cost.toLocaleString()}원
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>참석 인원:</Text>
                  <Text style={styles.detailValue}>{selectedMeeting.attendees}명</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>1인당 비용:</Text>
                  <Text style={styles.detailValue}>
                    {Math.round(selectedMeeting.cost / selectedMeeting.attendees).toLocaleString()}원
                  </Text>
                </View>

                {selectedMeeting.imageUri ? (
                  <Image
                    source={{ uri: selectedMeeting.imageUri }}
                    style={styles.detailImage}
                  />
                ) : null}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    minHeight: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
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
    marginBottom: 8,
  },
  costPerPerson: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 50,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2196F3',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
