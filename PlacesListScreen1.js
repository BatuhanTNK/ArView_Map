//Kullanılmıyor 
/*
import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  FlatList, ActivityIndicator, Modal, Image
} from 'react-native';

// Bu bileşen artık veri çekme mantığını içermiyor.
// Bunun yerine, verileri ve fonksiyonları `App.js`'ten prop olarak alıyor.
const PlacesListScreen = ({ places, isLoading, error, onNavigateToAR }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handlePlacePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  // Ekranda ne gösterileceğini belirleyen render fonksiyonu
  const renderContent = () => {
    // Veriler hala yükleniyorsa...
    if (isLoading) {
      return <ActivityIndicator size="large" color="#FFFFFF" style={styles.centered} />;
    }
    // Veri çekerken bir hata oluştuysa...
    if (error) {
      return <Text style={styles.errorText}>Veriler yüklenemedi. Lütfen sunucunun çalıştığından ve aynı ağda olduğunuzdan emin olun.</Text>;
    }
    // Her şey yolundaysa, mekanların listesini göster
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} resizeMode="contain" />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Stillerde herhangi bir değişiklik yok
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF6B6B', textAlign: 'center', marginTop: 50, paddingHorizontal: 20 },
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

export default PlacesListScreen;

*/

