// services/GeolocationService.js

const ALLOWED_COUNTRIES = ['US', 'USA', 'United States']; // Códigos de país permitidos
const GEO_API_URL = 'https://ipapi.co/json/'; // API gratuita para geolocalización por IP

/**
 * Verificar si la ubicación del usuario está permitida
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const checkGeolocation = async () => {
  try {
    // Intentar obtener la ubicación mediante la API de geolocalización
    const locationData = await getLocationData();
    
    // Si no se pudo obtener la ubicación, denegar por precaución
    if (!locationData || !locationData.country_code) {
      console.warn('Could not determine location, denying access');
      return {
        allowed: false,
        reason: 'Unable to verify location',
        location: null
      };
    }
    
    // Verificar si el país está en la lista de permitidos
    const isAllowed = ALLOWED_COUNTRIES.includes(locationData.country_code) ||
                     ALLOWED_COUNTRIES.includes(locationData.country_name);
    
    return {
      allowed: isAllowed,
      reason: isAllowed ? 'Location allowed' : 'Geographic restriction',
      location: {
        country: locationData.country_name,
        countryCode: locationData.country_code,
        region: locationData.region,
        city: locationData.city,
        ip: locationData.ip
      }
    };
  } catch (error) {
    console.error('Error checking geolocation:', error);
    
    // En caso de error, permitir acceso (opcional, puede cambiarse a denegar)
    return {
      allowed: false,
      reason: 'Error verifying location',
      error: error.message
    };
  }
};

/**
 * Obtener datos de ubicación del usuario
 * @returns {Promise<Object>} Datos de ubicación
 */
const getLocationData = async () => {
  try {
    // Hacer solicitud a la API de geolocalización
    const response = await fetch(GEO_API_URL);
    
    if (!response.ok) {
      throw new Error(`Geolocation API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting location data:', error);
    return null;
  }
};

/**
 * Servicio completo de geolocalización
 */
class GeolocationService {
  /**
   * Verificar acceso por ubicación
   * @returns {Promise<Object>} Resultado de la verificación
   */
  static async verifyLocationAccess() {
    return await checkGeolocation();
  }
  
  /**
   * Obtener información detallada de la ubicación
   * @returns {Promise<Object>} Información de ubicación
   */
  static async getDetailedLocation() {
    try {
      const locationData = await getLocationData();
      return locationData;
    } catch (error) {
      console.error('Error getting detailed location:', error);
      return null;
    }
  }
  
  /**
   * Comprobar si el país del usuario está permitido
   * @param {string} countryCode - Código de país a verificar
   * @returns {boolean} True si está permitido
   */
  static isCountryAllowed(countryCode) {
    if (!countryCode) return false;
    return ALLOWED_COUNTRIES.includes(countryCode.toUpperCase());
  }
}

export default GeolocationService;