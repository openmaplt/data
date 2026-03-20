'use client';

import { useEffect, useRef } from 'react';

interface POIChangeMapProps {
  lat: number;
  lon: number;
}

export default function POIChangeMap({ lat, lon }: POIChangeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!mapRef.current || initialized.current) return;

    const loadOL = async () => {
      // Create script and link tags for OpenLayers
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/ol@v10.3.1/ol.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ol@v10.3.1/dist/ol.js';
      script.async = true;

      script.onload = () => {
        if (!mapRef.current) return;

        // @ts-expect-error - OL is loaded from CDN
        const ol = window.ol;

        const _map = new ol.Map({
          target: mapRef.current,
          layers: [
            new ol.layer.Tile({
              source: new ol.source.OSM({
                url: 'https://dev.openmap.lt/tiles/{z}/{x}/{y}.png',
                crossOrigin: null,
              }),
            }),
            // Add a marker for the POI
            new ol.layer.Vector({
              source: new ol.source.Vector({
                features: [
                  new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
                  }),
                ],
              }),
              style: new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 8,
                  fill: new ol.style.Fill({ color: '#2563eb' }),
                  stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
                }),
              }),
            }),
          ],
          view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: 17,
          }),
        });

        initialized.current = true;
      };

      document.body.appendChild(script);
    };

    loadOL();

    return () => {
      // Clean up map container if needed (though OL handles it well)
    };
  }, [lat, lon]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 px-1 text-uppercase tracking-wider">
        Žemėlapis
      </h3>
      <div
        ref={mapRef}
        className="w-full h-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner bg-slate-50 relative z-0"
      />
    </div>
  );
}
