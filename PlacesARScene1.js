//Kulanılmıyor

/*
'use strict';

import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  ViroARScene,
  ViroText,
  ViroNode,
  ViroBillboard,
} from '@reactvision/react-viro';

// Enlem/Boylam'ı metre cinsinden X ve Z koordinatlarına dönüştüren fonksiyon
const latLonToMercator = (latDeg, lonDeg) => {
  const lonRad = (lonDeg * Math.PI) / 180;
  const latRad = (latDeg * Math.PI) / 180;
  const earthRadius = 6378137; // Dünya'nın yarıçapı (metre)
  const x = earthRadius * lonRad;
  const z = earthRadius * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  return { x, z };
};

// DİKKAT: 'export' kelimesini doğrudan fonksiyonun başına ekledik.
export const PlacesARScene = (props) => {
  const [places3D, setPlaces3D] = useState([]);

  useEffect(() => {
    const { places, userLocation } = props.sceneNavigator.viroAppProps;
    if (places && userLocation) {
      const userMercator = latLonToMercator(userLocation.latitude, userLocation.longitude);
      const updatedPlaces3D = places.map(place => {
        const placeMercator = latLonToMercator(place.latitude, place.longitude);
        const y = 0;
        const x = placeMercator.x - userMercator.x;
        const z = -(placeMercator.z - userMercator.z);
        return {
          id: place.id,
          name: place.name,
          position: [x, y, z],
        };
      });
      setPlaces3D(updatedPlaces3D);
    }
  }, [props.sceneNavigator.viroAppProps]);

  return (
    <ViroARScene>
      {places3D.map(place => (
        <ViroNode key={place.id} position={place.position}>
          <ViroBillboard>
            <ViroText
              text={place.name}
              scale={[3, 3, 3]}
              style={styles.placeTextStyle}
              extrusionDepth={0.5}
            />
          </ViroBillboard>
        </ViroNode>
      ))}
    </ViroARScene>
  );
};

const styles = StyleSheet.create({
  placeTextStyle: {
    fontFamily: 'Arial',
    fontSize: 20,
    color: '#FFFFFF',
    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

*/

