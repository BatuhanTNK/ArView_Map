import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViroARScene, ViroNode, ViroImage, ViroQuad, ViroText } from '@reactvision/react-viro';
import { accelerometer, magnetometer } from 'react-native-sensors';
import { latLonToMercator } from '../utils/arUtils';
import { MIN_SCALE, MAX_SCALE, MIN_DISTANCE, MAX_DISTANCE, COSINE_THRESHOLD } from '../constants';


const vectorNormalize = (vec) => {
  const mag = Math.sqrt(vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2);
  if (mag === 0) return [0, 0, 0];
  return [vec[0] / mag, vec[1] / mag, vec[2] / mag];
};
const vectorDot = (vec1, vec2) => {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
};
const crossProduct = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const vectorNorm = (a) => Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);


const PlacesARScene = ({ places, userLocation, onFocusPlace }) => {
  const [places3D, setPlaces3D] = useState([]);
  const [visiblePlaces, setVisiblePlaces] = useState(new Set());
  const [initialUserMercator, setInitialUserMercator] = useState(null);
  const [calibrationStatus, setCalibrationStatus] = useState('pending');
  const [currentHeading, setCurrentHeading] = useState(0);
  const [initialHeading, setInitialHeading] = useState(null);
  const headingRef = useRef(0);

  const gravityRef = useRef([0, 0, 9.8]);
  const geomagneticRef = useRef([0, 20, -35]);

  useEffect(() => {
    const accelSubscription = accelerometer.subscribe(({ x, y, z }) => {
      gravityRef.current = [x, y, z];
    });

    const magnetoSubscription = magnetometer.subscribe(({ x, y, z }) => {
      geomagneticRef.current = [x, y, z];
    });

    const headingInterval = setInterval(() => {
      try {
        const Ex = crossProduct(geomagneticRef.current, gravityRef.current);
        const H = geomagneticRef.current;

        const normH = vectorNorm(H);
        const normEx = vectorNorm(Ex);
        
        if (normH < 0.1 || normEx < 0.1) {
            return;
        }

        const Hx = H[0] / normH;
        const Mx = Ex[0] / normEx;

        let yaw = Math.atan2(Mx, Hx);
        
        let headingInDegrees = (yaw * 180 / Math.PI + 360) % 360;
        
        // ✅ DEĞİŞTİRİLDİ: Düzeltme değeri 92 derece olarak ayarlandı.
        let correctedHeading = (headingInDegrees - 92 + 360) % 360;
        
        setCurrentHeading(correctedHeading);
        headingRef.current = correctedHeading;
      } catch (error) {
        console.error("Yön hesaplama hatası:", error);
      }
    }, 250);

    return () => {
      accelSubscription.unsubscribe();
      magnetoSubscription.unsubscribe();
      clearInterval(headingInterval);
    };
  }, []);

  // Kalibrasyon mantığı (Değişiklik yok)
  useEffect(() => {
    setCalibrationStatus('stabilizing');
    const timer = setTimeout(() => {
      const finalHeading = headingRef.current;
      console.log(`KALİBRASYON TAMAMLANDI: Başlangıç yönü ${finalHeading.toFixed(1)}°`);
      setInitialHeading(finalHeading);
      setCalibrationStatus('calibrated');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    if (userLocation && !initialUserMercator) {
      setInitialUserMercator(latLonToMercator(userLocation.latitude, userLocation.longitude));
    }
  }, [userLocation, initialUserMercator]);

  useEffect(() => {
    if (!places || !initialUserMercator || initialHeading === null) return;
    const headingRad = -initialHeading * (Math.PI / 180);
    const cosH = Math.cos(headingRad);
    const sinH = Math.sin(headingRad);
    const updatedPlaces = places.map(place => {
      const placeMercator = latLonToMercator(place.latitude, place.longitude);
      const deltaX = placeMercator.x - initialUserMercator.x;
      const deltaZ = -(placeMercator.z - initialUserMercator.z);
      const rotatedX = deltaX * cosH - deltaZ * sinH;
      const rotatedZ = deltaX * sinH + deltaZ * cosH;
      const position = [rotatedX, 0, rotatedZ];
      const distance = Math.sqrt(rotatedX ** 2 + rotatedZ ** 2);
      let scale = MIN_SCALE;
      const distanceRange = MAX_DISTANCE - MIN_DISTANCE;
      if (distance <= MIN_DISTANCE) scale = MAX_SCALE;
      else if (distance < MAX_DISTANCE && distanceRange > 0) {
        const ratio = (distance - MIN_DISTANCE) / distanceRange;
        scale = MAX_SCALE - ratio * (MAX_SCALE - MIN_SCALE);
      }
      if (isNaN(scale)) scale = MIN_SCALE;
      const normalizedVector = vectorNormalize(position);
      return { id: place.id, name: place.name, position, normalizedVector, imageUrl: place.photo_url, scale };
    });
    setPlaces3D(updatedPlaces);
  }, [places, initialUserMercator, initialHeading]);

  const handleCameraTransform = useCallback((cameraTransform) => {
    if (calibrationStatus !== 'calibrated' || places3D.length === 0) return;
    const cameraForward = cameraTransform.forward;
    let bestMatch = null;
    let highestDot = -1;
    const currentlyVisible = new Set();
    for (const place of places3D) {
      const dotProduct = vectorDot(cameraForward, place.normalizedVector);
      if (dotProduct > COSINE_THRESHOLD) {
        currentlyVisible.add(place.id);
        if (dotProduct > highestDot) {
          highestDot = dotProduct;
          bestMatch = place;
        }
      }
    }
    setVisiblePlaces(currentlyVisible);
    onFocusPlace(bestMatch);
  }, [calibrationStatus, places3D, onFocusPlace]);

  const getCalibrationText = () => {
    if (calibrationStatus === 'stabilizing') {
      return 'Kalibre ediliyor, lütfen bekleyin...';
    }
    return `Yön: ${Math.round(currentHeading)}°`;
  };

  return (
    <ViroARScene onCameraTransformUpdate={handleCameraTransform}>
      {calibrationStatus !== 'calibrated' ? (
        <ViroNode position={[0, 0, -5]} transformBehaviors={['billboard']}>
          <ViroText text={getCalibrationText()} scale={[0.8, 0.8, 0.8]} style={{ fontFamily: 'Arial', fontSize: 25, color: '#FFFFFF', textAlign: 'center' }} width={6} />
        </ViroNode>
      ) : (
        places3D.map(place =>
          visiblePlaces.has(place.id) && (
            <ViroNode key={place.id} position={place.position} transformBehaviors={['billboard']} scale={[place.scale, place.scale, place.scale]}>
              <ViroQuad height={1.5} width={1.5} position={[0, 0, -0.01]} materials={["backgroundMaterial"]} />
              <ViroImage height={1.4} width={1.4} position={[0, 0, 0.01]} source={{ uri: place.imageUrl }} />
            </ViroNode>
          )
        )
      )}
    </ViroARScene>
  );
};

export default PlacesARScene;
