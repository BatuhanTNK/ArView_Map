import { StyleSheet } from 'react-native';
import { ViroMaterials } from '@reactvision/react-viro';

export const styles = StyleSheet.create({
  // --- MEVCUT STİLLERİNİZ ---
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

  // --- YENİ EKLENEN HARİTA VE BUTON STİLLERİ ---
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  toggleContainer: {
    position: 'absolute',
    top: 50,
    left: '25%',
    right: '25%',
    flexDirection: 'row',
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 25,
    zIndex: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#404040'
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#1DB954',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

ViroMaterials.createMaterials({ 
  backgroundMaterial: { 
    diffuseColor: 'rgba(0, 0, 0, 0.5)',
    writesToDepthBuffer: true,
    readsFromDepthBuffer: true 
  } 
});