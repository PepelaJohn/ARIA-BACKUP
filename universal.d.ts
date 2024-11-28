interface ServiceProvider {
    id: number;
    type: keyof  images; // 'Cab' | 'Rider' | 'Jet' | 'Truck' | 'Drone'
    coordinates: Coordinates;
    online: boolean;
  }

  interface images {
    Cab: string;
    Rider: string;
    Jet: string;
    Truck: string;
    Drone: string;
}

interface Coordinates {
    latitude: number;
    longitude: number;
  }


  interface RootObject {
  lat: number;
  lng: number;
  userId: string;
  providerType: string;
  socketid: string;
}


