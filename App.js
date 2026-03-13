import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Animated, 
  Easing, 
  Dimensions, 
  ImageBackground 
} from 'react-native';

import HomeScreen from './screens/HomeScreen';
import AddMeetingScreen from './screens/AddMeetingScreen';
import ViewMeetingsScreen from './screens/ViewMeetingsScreen';
import EditMeetingScreen from './screens/EditMeetingScreen';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const navigateTo = (screen, meeting = null) => {
    setCurrentScreen(screen);
    setSelectedMeeting(meeting);
  };

  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -400], 
  });
  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -400],
  });

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={navigateTo} />;
      case 'add':
        return <AddMeetingScreen onNavigate={navigateTo} />;
      case 'view':
        return <ViewMeetingsScreen onNavigate={navigateTo} />;
      case 'edit':
        return <EditMeetingScreen onNavigate={navigateTo} meeting={selectedMeeting} />;
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[
            styles.animatedBackground,
            { transform: [{ translateX }, { translateY }, { scale: 2.0 }] },
          ]}
        >
          <ImageBackground
            source={require('./assets/mark_20x20_1600_transparent.png')}
            style={styles.backgroundImage}
            resizeMode="repeat"
          />
        </Animated.View>
      </View>

      <View style={styles.contentLayer}>
        {renderScreen()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5', 
  },
  animatedBackground: {
    width: width * 3,
    height: height * 3,
    position: 'absolute',
    top: -height,
    left: -width,
  },
  backgroundImage: {
    flex: 1,
    opacity: 0.2,
  },
  contentLayer: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
});