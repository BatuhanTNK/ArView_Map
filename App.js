import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, PermissionsAndroid, Platform, Animated, Image } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import Geolocation from 'react-native-geolocation-service';


import { VIRO_API_KEY, API_URL } from './constants';
import PlacesARScene from './components/PlacesARScene';
import PlacesListScreen from './components/PlacesListScreen';
import { styles } from './styles';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('LIST');
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [focusedPlace, setFocusedPlace] = useState(null);
  const locationWatcherId = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [arKey, setArKey] = useState(0);

 

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: focusedPlace ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [focusedPlace, fadeAnim]);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) { return false; }
    }
    return true;
  }, []);

  const fetchPlaces = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Sunucuya bağlanılamadı!');
      const data = await response.json();
      setPlaces(data);
    } catch (e) { setError(e); }
  }, []);

  const startLocationTracking = useCallback(() => {
    if (locationWatcherId.current) Geolocation.clearWatch(locationWatcherId.current);
    locationWatcherId.current = Geolocation.watchPosition(
      (position) => setUserLocation(position.coords),
      (e) => setError(new Error("Konum bilgisi alınamadı.")),
      { enableHighAccuracy: true, distanceFilter: 2, interval: 2000, fastestInterval: 1000 }
    );
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchPlaces();
      const hasPermission = await requestLocationPermission();
      if (hasPermission) startLocationTracking();
      else setError(new Error("Konum izni gerekli."));
      setIsLoading(false);
    };
    initialize();
    return () => {
      if (locationWatcherId.current) Geolocation.clearWatch(locationWatcherId.current);
    };
  }, [fetchPlaces, requestLocationPermission, startLocationTracking]);

  

  const navigateToAR = useCallback(() => {
    setArKey(prevKey => prevKey + 1);
    setCurrentScreen('AR');
  }, []);

  if (currentScreen === 'AR') {
    if (!userLocation) {
      return ( <View style={styles.centered}><ActivityIndicator size="large" color="#FFFFFF" /><Text style={styles.errorText}>Konum bekleniyor...</Text></View> );
    }
    
    return (
      <View style={{ flex: 1 }}>
        <ViroARSceneNavigator
          key={arKey}
          apiKey={VIRO_API_KEY}
          worldAlignment="GravityAndHeading"
          initialScene={{ scene: () => <PlacesARScene places={places} userLocation={userLocation} onFocusPlace={setFocusedPlace} /> }}
        />
        
        

        <Animated.View style={[styles.focusedPlaceContainer, { opacity: fadeAnim }]}>
          <Text style={styles.focusedPlaceText}>{focusedPlace ? focusedPlace.name : ''}</Text>
          {focusedPlace && <Image source={{ uri: focusedPlace.imageUrl }} style={styles.focusedPlaceImage} resizeMode="cover"/>}
        </Animated.View>
      </View>
    );
  }

  return ( <PlacesListScreen places={places} isLoading={isLoading} error={error} onNavigateToAR={navigateToAR} userLocation={userLocation} /> );
};

export default App;
