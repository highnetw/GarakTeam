import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import AddMeetingScreen from './screens/AddMeetingScreen';
import ViewMeetingsScreen from './screens/ViewMeetingsScreen';
import EditMeetingScreen from './screens/EditMeetingScreen';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 50000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [moveAnim]);

  const moveX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -800],
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
    <View style={{ flex: 1 }}>
      <View style={styles.bgContainer} pointerEvents="none">
        <Animated.Image
          source={require('./assets/mark_20x20_1600_transparent_w_margin.png')}
          style={[
            styles.bgImage,
            {
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
}

const styles = StyleSheet.create({
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: -1,
    overflow: 'hidden',
  },
  bgImage: {
    width: 1600,
    height: 1600,
    opacity: 0.1,
  },
});