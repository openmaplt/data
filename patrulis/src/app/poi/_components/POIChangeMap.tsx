'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import {
  FullscreenControl,
  Map as MapLibre,
  Marker,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl/maplibre';

interface POIChangeMapProps {
  lat: number;
  lon: number;
}

export default function POIChangeMap({ lat, lon }: POIChangeMapProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 px-1 text-uppercase tracking-wider">
        Žemėlapis
      </h3>
      <div className="w-full h-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner bg-slate-50 relative z-0">
        <MapLibre
          initialViewState={{
            latitude: lat,
            longitude: lon,
            zoom: 17,
          }}
          mapStyle="https://openmap.lt/styles/map.json"
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl
            position="top-right"
            showCompass={true}
            visualizePitch={true}
          />
          <FullscreenControl position="top-right" />
          <ScaleControl position="bottom-left" unit="metric" />
          <Marker latitude={lat} longitude={lon} anchor="bottom">
            <div className="relative flex flex-col items-center group">
              {/* Outer ring animation */}
              <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping" />

              {/* Pin marker */}
              <div className="relative flex items-center justify-center">
                {/* Pointer part */}
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white shadow-xl transition-transform group-hover:scale-110">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                {/* Stem part */}
                <div className="absolute top-[28px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
              </div>
            </div>
          </Marker>
        </MapLibre>
      </div>
    </div>
  );
}
