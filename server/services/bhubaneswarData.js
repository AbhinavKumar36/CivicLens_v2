import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data/bhubaneswar');

// In-memory cache for ward demographic profiles & slum stats
let wardDemographicsMap = null;
let osmAmenitiesList = null;

export function loadBhubaneswarData() {
  if (wardDemographicsMap) return { wardDemographicsMap, osmAmenitiesList };

  wardDemographicsMap = {};
  osmAmenitiesList = [];

  try {
    // 1. Parse City Profile CSV
    const cityProfilePath = path.join(dataDir, 'City_Profile_Bhubaneswar_1_0 (1).csv');
    if (fs.existsSync(cityProfilePath)) {
      const lines = fs.readFileSync(cityProfilePath, 'utf8').split('\n');
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        const zone = cols[1];
        const wardRaw = cols[3]?.trim();
        const wardNo = wardRaw ? wardRaw.replace(/^W/, '') : '';
        const areaSqKm = parseFloat(cols[4]) || 0;
        const totalPopK = parseFloat(cols[5]) || 0;
        const malePopK = parseFloat(cols[6]) || 0;
        const femalePopK = parseFloat(cols[7]) || 0;
        const childrenPopK = parseFloat(cols[8]) || 0;
        const youthPopK = parseFloat(cols[9]) || 0;

        if (wardNo) {
          wardDemographicsMap[wardNo] = {
            wardNo,
            wardKey: `Ward ${wardNo}`,
            zone: zone || 'Central',
            areaSqKm,
            population: Math.round(totalPopK * 1000),
            malePopulation: Math.round(malePopK * 1000),
            femalePopulation: Math.round(femalePopK * 1000),
            childrenPopulation: Math.round(childrenPopK * 1000),
            youthPopulation: Math.round(youthPopK * 1000),
            slumPopulation: 0,
            notifiedSlums: 0,
            identifiedSlums: 0,
            source: 'Bhubaneswar Municipal Corporation / Census of India',
            isOfficial: true
          };
        }
      }
    }

    // 2. Parse Slum Housing CSV
    const slumHousingPath = path.join(dataDir, 'Slum_Housing_Bhubaneswar_1.csv');
    if (fs.existsSync(slumHousingPath)) {
      const lines = fs.readFileSync(slumHousingPath, 'utf8').split('\n');
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        const wardNo = cols[3]?.trim();
        const identifiedSlums = parseInt(cols[6], 10) || 0;
        const slumPop = parseInt(cols[7], 10) || 0;

        if (wardNo && wardDemographicsMap[wardNo]) {
          wardDemographicsMap[wardNo].slumPopulation = slumPop;
          wardDemographicsMap[wardNo].identifiedSlums = identifiedSlums;
        } else if (wardNo) {
          wardDemographicsMap[wardNo] = {
            wardNo,
            wardKey: `Ward ${wardNo}`,
            zone: cols[1] || 'Central',
            population: slumPop * 2,
            slumPopulation: slumPop,
            identifiedSlums,
            source: 'Bhubaneswar Slum Housing Survey',
            isOfficial: true
          };
        }
      }
    }

    // 3. Parse OSM Amenities
    const osmPath = path.join(dataDir, 'osm-amenities.geojson');
    if (fs.existsSync(osmPath)) {
      const geojson = JSON.parse(fs.readFileSync(osmPath, 'utf8'));
      if (geojson.features) {
        osmAmenitiesList = geojson.features.slice(0, 500).map((f, idx) => {
          const coords = f.geometry?.coordinates || [85.824, 20.296];
          const amenityType = f.properties?.amenity || 'facility';
          const name = f.properties?.name || `${amenityType} #${idx + 1}`;
          let category = 'INFRASTRUCTURE';
          if (['hospital', 'clinic', 'pharmacy', 'doctors'].includes(amenityType)) category = 'HEALTHCARE';
          if (['school', 'college', 'kindergarten', 'university'].includes(amenityType)) category = 'EDUCATION';
          if (['waste_basket', 'waste_disposal', 'recycling'].includes(amenityType)) category = 'SANITATION';
          if (['water_point', 'drinking_water'].includes(amenityType)) category = 'WATER';
          if (['police', 'fire_station'].includes(amenityType)) category = 'PUBLIC_SAFETY';

          return {
            id: idx + 1,
            name,
            amenityType,
            category,
            lat: coords[1],
            lng: coords[0],
            properties: f.properties
          };
        });
      }
    }
  } catch (err) {
    console.warn('Warning loading Bhubaneswar datasets:', err.message);
  }

  return { wardDemographicsMap, osmAmenitiesList };
}

export function getWardDemographics(wardIdentifier) {
  loadBhubaneswarData();
  if (!wardIdentifier) return null;
  const cleanNo = wardIdentifier.toString().replace(/[^0-9]/g, '');
  return wardDemographicsMap[cleanNo] || null;
}

export function getAllWardDemographics() {
  loadBhubaneswarData();
  return Object.values(wardDemographicsMap || {});
}

export function getNearbyAmenities(lat, lng, radiusKm = 5, category = null) {
  loadBhubaneswarData();
  if (!lat || !lng) return [];

  return (osmAmenitiesList || []).filter(amenity => {
    if (category && amenity.category.toUpperCase() !== category.toUpperCase()) return false;
    const dLat = (amenity.lat - lat) * 111;
    const dLng = (amenity.lng - lng) * 111 * Math.cos(lat * (Math.PI / 180));
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return dist <= radiusKm;
  });
}
