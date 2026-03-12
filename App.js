import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native'; // 1. 필수 모듈 추가
import HomeScreen from './screens/HomeScreen';
import AddMeetingScreen from './screens/AddMeetingScreen';
import ViewMeetingsScreen from './screens/ViewMeetingsScreen';
import EditMeetingScreen from './screens/EditMeetingScreen';

// 화면의 너비와 높이를 가져옵니다.
const { width, height } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // 2. 애니메이션을 위한 변수 설정 (Ref를 사용하여 값이 초기화되지 않게 함)
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 3. 무한 반복 애니메이션 시작
    Animated.loop(
      Animated.timing(moveAnim, {
        toValue: 1, // 0에서 1까지 변화
        duration: 50000, // 50초 동안 천천히 이동 (숫자가 클수록 느려짐)
        easing: Easing.linear, // 일정한 속도로
        useNativeDriver: true, // 부드러운 성능을 위해 필수
      })
    ).start();
  }, [moveAnim]);

  // 4. 움직임 계산 (X축과 Y축을 동시에 움직여 대각선 흐름 생성)
  const moveX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -800], // 이미지 크기의 절반만큼 왼쪽으로 이동
  });

  const navigateTo = (screen, meeting = null) => {
    setCurrentScreen(screen);
    setSelectedMeeting(meeting);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen onNavigate={navigateTo} />;
      case 'add': return <AddMeetingScreen onNavigate={navigateTo} />;
      case 'view': return <ViewMeetingsScreen onNavigate={navigateTo} />;
      case 'edit': return <EditMeetingScreen onNavigate={navigateTo} meeting={selectedMeeting} />;
      default: return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
  <View style={{ flex: 1, backgroundColor: 'red' }}>
    <View style={styles.bgContainer} pointerEvents="none">
      <Animated.Image
        source={require('./assets/mark_20x20_1600_transparent_w_margin.png')}
        style={[
          styles.bgImage,
          {
            opacity: 0.5,  // ← 0.1에서 0.5로 높여봐요
            transform: [
              { translateX: moveX },
              { rotate: '-15deg' },
              { scale: 2 },
            ],
          },
        ]}
        resizeMode="repeat"
      />
    </View>
    {renderScreen()}
  </View>
);

// 6. 스타일 설정
const styles = StyleSheet.create({
  bgContainer: {
    ...StyleSheet.absoluteFillObject, // 화면 전체 꽉 채우기
    backgroundColor: '#ffffff', // 배경색 (교표가 투명이므로 흰색 바탕 필요)
    zIndex: -1, // 콘텐츠보다 아래로
    overflow: 'hidden', // 화면 밖으로 나가는 이미지 숨기기
  },
  bgImage: {
    width: 1600, // 이미지 원본 너비
    height: 1600, // 이미지 원본 높이
    opacity: 0.1, // 0.1(10%)~0.2(20%) 사이가 글자 보기에 가장 좋습니다.
  },
});