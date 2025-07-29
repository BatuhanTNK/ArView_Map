import React, { useState, useEffect, useCallback, memo } from 'react';
import { ViroARScene, ViroNode, ViroImage, ViroQuad } from '@reactvision/react-viro';
// DİKKAT: Import yolları güncellendi
import { latLonToMercator } from '../utils/arUtils';
import { PLACE_SIZE, FOCUS_THRESHOLD } from '../constants';

const vectorNormalize = (vec) => {
  const mag = Math.sqrt(vec[0]**2 + vec[1]**2 + vec[2]**2);
  if (mag === 0) return [0, 0, 0];
  return [vec[0] / mag, vec[1] / mag, vec[2] / mag];
};

const vectorDot = (vec1, vec2) => {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
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
      const fixedDistance = 10;
      const x = Math.cos(arAngle) * fixedDistance;
      const z = Math.sin(arAngle) * fixedDistance;
      const magnitude = Math.sqrt(x**2 + z**2);
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
      const dotProduct = vectorDot(cameraForward, place.normalizedVector);
      if (dotProduct > highestDot) {
        highestDot = dotProduct;
        bestMatch = place;
      }
    }
    if (highestDot > FOCUS_THRESHOLD) onFocusPlace(bestMatch);
    else onFocusPlace(null);
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

export default PlacesARScene;
