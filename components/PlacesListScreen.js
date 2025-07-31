import React, { useState, useCallback, memo } from 'react';
import { SafeAreaView, StatusBar, FlatList, ActivityIndicator, Modal, View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { styles } from '../styles';

const PlacesListScreen = memo(({ places, isLoading, error, onNavigateToAR, userLocation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('LIST');

  const handlePlacePress = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  }, []);

  const renderMapView = () => {
    if (!userLocation || places.length === 0) {
      return <ActivityIndicator size="large" color="#FFFFFF" style={styles.centered} />;
    }

    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
      >
        {places.map(place => (
          <Marker
            key={place.id}
            // !!! DEĞİŞİKLİK BURADA !!!
            // Gelen string veriyi sayıya çeviriyoruz.
            coordinate={{
              latitude: parseFloat(place.latitude),
              longitude: parseFloat(place.longitude),
            }}
            title={place.name}
            description={place.type}
          />
        ))}
      </MapView>
    );
  };

  const renderListView = () => (
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

  const renderContent = () => {
    if (isLoading) return <ActivityIndicator size="large" color="#FFFFFF" style={styles.centered} />;
    if (error) return <Text style={styles.errorText}>{error.message}</Text>;
    return viewMode === 'LIST' ? renderListView() : renderMapView();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'LIST' && styles.toggleButtonActive]}
          onPress={() => setViewMode('LIST')}
        >
          <Text style={styles.toggleButtonText}>Liste</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'MAP' && styles.toggleButtonActive]}
          onPress={() => setViewMode('MAP')}
        >
          <Text style={styles.toggleButtonText}>Harita</Text>
        </TouchableOpacity>
      </View>
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

export default PlacesListScreen;