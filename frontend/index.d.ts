interface userData {
  username: string;
  email?: string;
  name?: string;
  password: string;
  repeatPassword?: string;
  role?: "consumer" | "admin" | "service-provider" | "corporate";
  providerType?: string;
  vehicleRegistrationNumber?: string;
  preferredPayment?:string;
  phoneNumber?:string
}



interface Suggestion {
  name: string;
  coordinates: Coordinates;
}

// declare namespace H {
//   namespace map {
//     class Map {
//       constructor(
//         element: HTMLElement,
//         baseLayer: H.map.layer.BaseLayer,
//         options?: any
//       );
//       addObject(object: any): void;
//       getViewModel(): any;
//       getObjects(): any;
//       removeObjects(objects: any[]): void;
//       getBoundingBox(): any;
//       getCenter(): any;
//       dispose(): void;
//     }
//     namespace layer {
//       class BaseLayer {}
//     }
//     class Polyline {
//       constructor(
//         lineString,
//         { style: { strokeColor: string, lineWidth: number } }
//       ) 
//       getBoundingBox():void
//     }
//   }
//   namespace geo {
//     class LineString {
//       constructor();
//       pushPoint(point: { lat: number; lng: number }): void;
//     }
//   }
//   namespace mapevents {
//     class MapEvents {
//       constructor(map: H.map.Map);
//     }
//     class Behavior {
//       constructor(events: H.mapevents.MapEvents);
//     }
//   }
//   namespace ui {
//     class UI {
//       static createDefault(map: H.map.Map, layers: any): H.ui.UI;
//     }
//   }
//   namespace service {
//     class Platform {
//       constructor(options: { apikey: string });
//       createDefaultLayers(): any;
//       getGeocodingService(): any;
//       getRoutingService(): any;
//     }
//   }
// }
