import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { View, ActivityIndicator, Text, PermissionsAndroid, Platform, Animated, Image } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import Geolocation from 'react-native-geolocation-service';

// DİKKAT: Dosya yolları projenizin yapısına göre güncellendi
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
      if (!response.ok) throw new Error('Server connection failed!');
      const data = await response.json();
      setPlaces(data);
    } catch (e) { setError(e); }
  }, []);

  const startLocationTracking = useCallback(() => {
    if (locationWatcherId.current) Geolocation.clearWatch(locationWatcherId.current);
    locationWatcherId.current = Geolocation.watchPosition(
      (position) => setUserLocation(position.coords),
      (e) => setError(new Error("Could not get location.")),
      { enableHighAccuracy: true, distanceFilter: 5, interval: 2000, fastestInterval: 1000 }
    );
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchPlaces();
      const hasPermission = await requestLocationPermission();
      if (hasPermission) startLocationTracking();
      else setError(new Error("Location permission required."));
      setIsLoading(false);
    };
    initialize();
    return () => {
      if (locationWatcherId.current) Geolocation.clearWatch(locationWatcherId.current);
    };
  }, [fetchPlaces, requestLocationPermission, startLocationTracking]);

  const navigateToAR = useCallback(() => setCurrentScreen('AR'), []);

  if (currentScreen === 'AR') {
    if (!userLocation) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.errorText}>Waiting for location...</Text>
        </View>
      );
    }
    
    return (
      <View style={{ flex: 1 }}>
        <ViroARSceneNavigator
          apiKey={VIRO_API_KEY}
          initialScene={{ scene: () => <PlacesARScene places={places} userLocation={userLocation} onFocusPlace={setFocusedPlace} /> }}
        />
        <Animated.View style={[styles.focusedPlaceContainer, { opacity: fadeAnim }]}>
          <Text style={styles.focusedPlaceText}>{focusedPlace ? focusedPlace.name : ''}</Text>
          {focusedPlace && <Image source={{ uri: focusedPlace.imageUrl }} style={styles.focusedPlaceImage} resizeMode="cover"/>}
        </Animated.View>
      </View>
    );
  }
 return (
    <PlacesListScreen
      places={places}
      isLoading={isLoading}
      error={error}
      onNavigateToAR={navigateToAR}
      userLocation={userLocation} 
    />
  );
};

export default App;







// Kaba Kod hali 
/*
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  FlatList, ActivityIndicator, Modal, Image, PermissionsAndroid, Platform,
  Animated // Animasyon için import edildi
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroNode,
  ViroImage,
  ViroQuad,
} from '@reactvision/react-viro';
import Geolocation from 'react-native-geolocation-service';

// Constants
const VIRO_API_KEY = "B94B5A6A-1415-45A9-B570-361595186084";
const API_URL = 'http://192.168.14.196:3000/api/places';
const FIXED_DISTANCE = 10; // Tüm mekanların görüneceği sabit uzaklık
const PLACE_SIZE = 2; // Tüm mekan kartlarının boyutu
const FOCUS_THRESHOLD = 0.95; // Odaklanma hassasiyeti düşürüldü 
const EARTH_RADIUS = 6378137;

// =================================================================
// AR SAHNESİ BİLEŞENİ
// =================================================================
const latLonToMercator = (latDeg, lonDeg) => {
  const lonRad = (lonDeg * Math.PI) / 180;
  const latRad = (latDeg * Math.PI) / 180;
  const x = EARTH_RADIUS * lonRad;
  const z = EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  return { x, z };
};

const PlacesARScene = memo(({ places, userLocation, onFocusPlace }) => {
  const [places3D, setPlaces3D] = useState([]);

  useEffect(() => {
    if (!places || !userLocation) return;
    const userMercator = latLonToMercator(userLocation.latitude, userLocation.longitude);
    const updatedPlaces = places.map(place => {
      const placeMercator = latLonToMercator(place.latitude, place.longitude);
      const deltaX = placeMercator.x - userMercator.x;
      const deltaZ = -(placeMercator.z - userMercator.z);
      const angle = Math.atan2(deltaZ, deltaX);
      const arAngle = angle - (Math.PI / 2);
      const x = Math.cos(arAngle) * FIXED_DISTANCE;
      const z = Math.sin(arAngle) * FIXED_DISTANCE;
      const magnitude = Math.sqrt(x * x + z * z);
      const normalizedVector = magnitude > 0 ? [x / magnitude, 0, z / magnitude] : [0, 0, 0];
      return { id: place.id, name: place.name, position: [x, 0, z], normalizedVector, imageUrl: place.photo_url };
    });
    setPlaces3D(updatedPlaces);
  }, [places, userLocation]);

  const handleCameraTransform = useCallback((cameraTransform) => {
    if (places3D.length === 0) return;
    const cameraForward = cameraTransform.forward;
    let bestMatch = null;
    let highestDot = -1;

    for (const place of places3D) {
      const dotProduct = cameraForward[0] * place.normalizedVector[0] + cameraForward[1] * place.normalizedVector[1] + cameraForward[2] * place.normalizedVector[2];
      if (dotProduct > highestDot) {
        highestDot = dotProduct;
        bestMatch = place;
      }
    }

    if (highestDot > FOCUS_THRESHOLD) {
      onFocusPlace(bestMatch);
    } else {
      onFocusPlace(null);
    }
  }, [places3D, onFocusPlace]);

  return (
    <ViroARScene onCameraTransformUpdate={handleCameraTransform}>
      {places3D.map(place => (
        <ViroNode key={place.id} position={place.position} transformBehaviors={['billboard']} scale={[PLACE_SIZE, PLACE_SIZE, PLACE_SIZE]}>
          <ViroQuad height={1.5} width={1.5} position={[0, 0, 0.01]} materials={["backgroundMaterial"]} />
          <ViroImage height={1.4} width={1.4} position={[0, 0, -0.01]} source={{ uri: place.imageUrl }} />
        </ViroNode>
      ))}
    </ViroARScene>
  );
});

// =================================================================
// LİSTE EKRANI BİLEŞENİ
// =================================================================
const PlacesListScreen = memo(({ places, isLoading, error, onNavigateToAR }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const handlePlacePress = useCallback((imageUrl) => { setSelectedImage(imageUrl); setModalVisible(true); }, []);
  
  const renderContent = () => {
    if (isLoading) return <ActivityIndicator size="large" color="#FFFFFF" style={styles.centered} />;
    if (error) return <Text style={styles.errorText}>{error.message}</Text>;
    return (
      <FlatList
        data={places}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.placeCard} onPress={() => handlePlacePress(item.photo_url)}>
            <Text style={styles.placeName}>{item.name}</Text>
            <Text style={styles.placeType}>{item.type}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 80 }}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderContent()}
      <TouchableOpacity style={styles.arButton} onPress={onNavigateToAR}>
        <Text style={styles.arButtonText}>AR</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} resizeMode="contain" />
        </View>
      </Modal>
    </SafeAreaView>
  );
});

// =================================================================
// ANA APP BİLEŞENİ
// =================================================================
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('LIST');
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [focusedPlace, setFocusedPlace] = useState(null);
  const locationWatcherId = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      if (!response.ok) throw new Error('Server connection failed!');
      const data = await response.json();
      setPlaces(data);
    } catch (e) { setError(e); }
  }, []);

  const startLocationTracking = useCallback(() => {
    if (locationWatcherId.current) Geolocation.clearWatch(locationWatcherId.current);
    locationWatcherId.current = Geolocation.watchPosition(
      (position) => setUserLocation(position.coords),
      (e) => setError(new Error("Could not get location.")),
      { enableHighAccuracy: true, distanceFilter: 5, interval: 2000, fastestInterval: 1000 }
    );
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchPlaces();
      const hasPermission = await requestLocationPermission();
      if (hasPermission) startLocationTracking();
      else setError(new Error("Location permission required."));
      setIsLoading(false);
    };
    initialize();
    return () => {
      if (locationWatcherId.current) Geolocation.clearWatch(locationWatcherId.current);
    };
  }, [fetchPlaces, requestLocationPermission, startLocationTracking]);

  const navigateToAR = useCallback(() => setCurrentScreen('AR'), []);

  if (currentScreen === 'AR') {
    if (!userLocation) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.errorText}>Waiting for location...</Text>
        </View>
      );
    }
    
    return (
      <View style={{ flex: 1 }}>
        <ViroARSceneNavigator
          apiKey={VIRO_API_KEY}
          initialScene={{ scene: () => <PlacesARScene places={places} userLocation={userLocation} onFocusPlace={setFocusedPlace} /> }}
        />
        <Animated.View style={[styles.focusedPlaceContainer, { opacity: fadeAnim }]}>
          <Text style={styles.focusedPlaceText}>{focusedPlace ? focusedPlace.name : ''}</Text>
          {focusedPlace && <Image source={{ uri: focusedPlace.imageUrl }} style={styles.focusedPlaceImage} resizeMode="cover"/>}
        </Animated.View>
      </View>
    );
  }

  return (
    <PlacesListScreen
      places={places}
      isLoading={isLoading}
      error={error}
      onNavigateToAR={navigateToAR}
    />
  );
};

// =================================================================
// STYLES
// =================================================================
const styles = StyleSheet.create({
  focusedPlaceContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
  },
  focusedPlaceText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  focusedPlaceImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  errorText: { color: '#FF6B6B', textAlign: 'center', marginTop: 20, paddingHorizontal: 20, fontSize: 16 },
  placeCard: { backgroundColor: '#282828', padding: 20, marginVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#404040' },
  placeName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  placeType: { color: '#B3B3B3', fontSize: 14, marginTop: 4 },
  arButton: { position: 'absolute', top: 50, right: 20, backgroundColor: '#1DB954', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  arButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: '100%', height: '80%' },
  closeButton: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  closeButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});

// Background material definition
import { ViroMaterials } from '@reactvision/react-viro';
ViroMaterials.createMaterials({ 
  backgroundMaterial: { 
    diffuseColor: 'rgba(0, 0, 0, 0.5)',
    writesToDepthBuffer: true,
    readsFromDepthBuffer: true 
  } 
});

export default App;
*/

