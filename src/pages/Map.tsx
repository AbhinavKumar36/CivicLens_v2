import React from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { MOCK_REPORTS } from "@/utils/mock-data"

export function MapView() {
  // Center roughly on New York for mock data
  const center: [number, number] = [40.7128, -74.0060]

  return (
    <div className="relative h-[calc(100vh-100px)] w-full rounded-3xl overflow-hidden shadow-2xl border border-foreground/10">
      <MapContainer 
        center={center} 
        zoom={14} 
        zoomControl={false}
        className="h-full w-full bg-surface-container"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />
        <ZoomControl position="bottomleft" />
        
        {MOCK_REPORTS.map((report) => (
          <Marker key={report.id} position={[report.location_lat, report.location_lng]}>
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-semibold font-body-md">{report.title}</h3>
                <p className="text-xs text-on-surface-variant mb-2">{report.address}</p>
                <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded inline-block">
                  {report.status}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Panel overlay on map */}
      <GlassPanel className="absolute top-4 right-4 w-72 p-4 z-[400] hidden md:block">
        <h3 className="font-headline-md text-headline-md mb-3">Live City Map</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 bg-foreground/5 rounded-lg">
            <span className="material-symbols-outlined text-primary">warning</span>
            <div>
              <p className="font-body-md text-sm">Active Issues</p>
              <p className="font-label-sm text-label-sm opacity-70">12 Reported</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-foreground/5 rounded-lg">
            <span className="material-symbols-outlined text-secondary">directions_car</span>
            <div>
              <p className="font-body-md text-sm">Traffic</p>
              <p className="font-label-sm text-label-sm opacity-70">Flowing</p>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
