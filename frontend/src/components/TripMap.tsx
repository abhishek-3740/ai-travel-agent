import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. CUSTOM ICONS ---

// Fix for default Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/** * 🎨 NEW: FUTURISTIC AI RADAR MARKER 
 * This uses CSS animations to create a rotating scanner + pulsing core.
 */
const userIcon = L.divIcon({
    className: "user-radar-marker",
    html: `
        <div class="relative flex items-center justify-center w-[50px] h-[50px] -translate-x-[15px] -translate-y-[15px]">
             <div class="absolute w-full h-full bg-cyan-500/20 rounded-full animate-ping"></div>
             
             <div class="absolute w-[36px] h-[36px] border-[2px] border-cyan-400/40 border-t-cyan-300 rounded-full animate-spin"></div>
             
             <div class="absolute w-[20px] h-[20px] bg-cyan-500/30 rounded-full blur-sm"></div>
             
             <div class="relative w-[12px] h-[12px] bg-cyan-400 rounded-full border-2 border-white shadow-[0_0_10px_#22d3ee]"></div>
        </div>
    `,
    iconSize: [20, 20], // Leaflet size reference
    iconAnchor: [10, 10] // Center point
});

const destIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- 2. MATH HELPER ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

// --- 3. RECENTER BUTTON ---
const RecenterButton = ({ userPos, onRecenter }: { userPos: [number, number] | null, onRecenter: () => void }) => {
    return (
        <button 
            onClick={onRecenter}
            className="absolute top-4 right-4 z-[1000] bg-slate-900/90 text-cyan-400 border border-cyan-500/30 p-2 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-slate-800 transition-all font-bold text-xs flex items-center gap-2 backdrop-blur-md"
            disabled={!userPos}
        >
            📡 {userPos ? "LOCATE ME" : "SCANNING..."}
        </button>
    );
};

// --- 4. MAIN MAP COMPONENT ---
const TripMap = ({ tripData }: { tripData: any }) => {
    const [userPos, setUserPos] = useState<[number, number] | null>(null);
    const [nearestActivity, setNearestActivity] = useState<any>(null);
    const [distanceToNext, setDistanceToNext] = useState<string>("");
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

    const allCoords: {lat: number, lng: number, name: string, day: number}[] = [];
    tripData?.daily_plans?.forEach((day: any) => {
        day.activities.forEach((act: any) => {
            if (act.latitude && act.longitude) {
                allCoords.push({ lat: act.latitude, lng: act.longitude, name: act.name, day: day.day_number });
            }
        });
    });

    const defaultCenter: [number, number] = allCoords.length > 0 
        ? [allCoords[0].lat, allCoords[0].lng] 
        : [20.5937, 78.9629];

    // Get Location
    useEffect(() => {
        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserPos([latitude, longitude]);

                    if (allCoords.length > 0) {
                        let minList = Infinity;
                        let nearest = null;

                        allCoords.forEach(coord => {
                            const dist = getDistance(latitude, longitude, coord.lat, coord.lng);
                            if (dist < minList) {
                                minList = dist;
                                nearest = coord;
                            }
                        });

                        setNearestActivity(nearest);
                        setDistanceToNext(minList < 1 ? `${(minList * 1000).toFixed(0)} m` : `${minList.toFixed(1)} km`);
                    }
                },
                (error) => console.error("Error getting location:", error),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [allCoords]);

    const handleRecenter = () => {
        if (userPos && mapInstance) {
            mapInstance.flyTo(userPos, 14);
        }
    };

    return (
        <div className="relative h-[600px] w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            
            {/* LIVE GUIDANCE HUD */}
            <AnimatePresence>
                {nearestActivity && userPos && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center gap-4"
                    >
                        <div className="relative bg-cyan-500/10 p-3 rounded-full border border-cyan-500/30">
                            <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                            🤖
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[2px]">Next Waypoint</p>
                            <h3 className="text-white font-bold text-lg leading-tight">{nearestActivity.name}</h3>
                            <p className="text-slate-400 text-sm">
                                Distance: <span className="text-cyan-300 font-mono font-bold">{distanceToNext}</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <RecenterButton userPos={userPos} onRecenter={handleRecenter} />

            <MapContainer 
                center={defaultCenter} 
                zoom={12} 
                scrollWheelZoom={true} 
                style={{ height: "100%", width: "100%" }}
                ref={setMapInstance}
            >
                {/* Dark Matter Tiles */}
                <TileLayer
                    attribution='&copy; OpenStreetMap &copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {tripData.daily_plans.map((day: any) => (
                    day.activities.map((act: any, idx: number) => (
                        act.latitude && act.longitude ? (
                            <Marker 
                                key={`${day.day_number}-${idx}`} 
                                position={[act.latitude, act.longitude]}
                                icon={destIcon}
                            >
                                <Popup className="text-black">
                                    <strong>{act.name}</strong><br/>
                                    {act.description.substring(0, 50)}...
                                </Popup>
                            </Marker>
                        ) : null
                    ))
                ))}

                {/* USER LOCATION & GUIDANCE LINE */}
                {userPos && (
                    <>
                        <Marker position={userPos} icon={userIcon}>
                            <Popup>You are here</Popup>
                        </Marker>

                        {nearestActivity && (
                            <Polyline 
                                positions={[userPos, [nearestActivity.lat, nearestActivity.lng]]}
                                pathOptions={{ 
                                    color: '#22d3ee', // Cyan
                                    weight: 3, 
                                    dashArray: '5, 10', // Dashed futuristic look
                                    opacity: 0.8,
                                    lineCap: 'round'
                                }} 
                            />
                        )}
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default TripMap;