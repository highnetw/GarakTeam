import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function HomeScreen({ onNavigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GrakTeam 모임 관리</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>메뉴를 선택하세요</Text>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => onNavigate('add')}
        >
          <Text style={styles.menuButtonText}>가. 새 모임 정보 입력</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => onNavigate('view')}
        >
          <Text style={styles.menuButtonText}>나. 과거 모임 기록 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => onNavigate('edit')}
        >
          <Text style={styles.menuButtonText}>다. 과거 모임 기록 수정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  menuButton: {
    backgroundColor: '#4A90E2',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  menuButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
