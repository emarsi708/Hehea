import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Loader2, Navigation, Phone, Globe, AlertCircle, Hospital, Stethoscope } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Flag } from "@/lib/types";

interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: "hospital" | "clinic" | "doctor" | "pharmacy";
  specialty?: string;
  address?: string;
  phone?: string;
  website?: string;
  distance: number;
}

const SPECIALTY_OPTIONS = [
  { value: "all", label: "All facilities" },
  { value: "hospital", label: "Hospitals" },
  { value: "general", label: "General doctors" },
  { value: "endocrinologist", label: "Endocrinologist (sugar/thyroid)" },
  { value: "cardiologist", label: "Cardiologist (heart/cholesterol)" },
  { value: "nephrologist", label: "Nephrologist (kidney)" },
  { value: "hepatologist", label: "Hepatologist (liver)" },
  { value: "hematologist", label: "Hematologist (blood)" },
  { value: "dietitian", label: "Dietitian / Nutritionist" },
];

interface NearbySpecialistsProps {
  flags: Flag[];
}

function suggestedSpecialty(flags: Flag[]): string {
  const cats = new Set(flags.map(f => f.category));
  if (cats.has("sugar") || cats.has("thyroid")) return "endocrinologist";
  if (cats.has("lipids")) return "cardiologist";
  if (cats.has("kidney")) return "nephrologist";
  if (cats.has("liver")) return "hepatologist";
  if (cats.has("cbc")) return "hematologist";
  return "all";
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  endocrinologist: ["endocrin", "diabet", "thyroid"],
  cardiologist: ["cardio", "heart"],
  nephrologist: ["nephro", "kidney", "renal"],
  hepatologist: ["hepato", "liver", "gastroentero"],
  hematologist: ["hemato", "haemato", "blood"],
  dietitian: ["diet", "nutrition"],
  general: ["general", "family", "physician", "internal"],
};

async function queryOverpass(lat: number, lon: number, radiusKm: number): Promise<Place[]> {
  const radius = Math.round(radiusKm * 1000);
  const query = `
[out:json][timeout:25];
(
  node["amenity"~"hospital|clinic|doctors|pharmacy"](around:${radius},${lat},${lon});
  way["amenity"~"hospital|clinic|doctors|pharmacy"](around:${radius},${lat},${lon});
);
out center tags 80;
`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });
  if (!res.ok) throw new Error("Failed to fetch nearby places.");
  const data = await res.json();
  const places: Place[] = (data.elements ?? []).map((el: Record<string, unknown> & { tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number }; id: number; type: string }) => {
    const placeLat = el.lat ?? el.center?.lat ?? 0;
    const placeLon = el.lon ?? el.center?.lon ?? 0;
    const tags = el.tags ?? {};
    const amenity = tags.amenity;
    const kind: Place["kind"] =
      amenity === "hospital" ? "hospital"
      : amenity === "doctors" ? "doctor"
      : amenity === "pharmacy" ? "pharmacy"
      : "clinic";
    const addressParts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean);
    return {
      id: `${el.type}/${el.id}`,
      name: tags.name || tags["operator"] || "Unnamed facility",
      lat: placeLat,
      lon: placeLon,
      kind,
      specialty: tags.healthcare_speciality || tags.speciality || tags.healthcare,
      address: addressParts.join(", ") || undefined,
      phone: tags.phone || tags["contact:phone"],
      website: tags.website || tags["contact:website"],
      distance: haversine(lat, lon, placeLat, placeLon),
    };
  });
  return places.filter(p => p.lat && p.lon && p.name !== "Unnamed facility");
}

function filterPlaces(places: Place[], specialty: string): Place[] {
  if (specialty === "all") return places;
  if (specialty === "hospital") return places.filter(p => p.kind === "hospital");
  const keywords = SPECIALTY_KEYWORDS[specialty] ?? [];
  if (keywords.length === 0) return places;
  return places.filter(p => {
    const haystack = `${p.name} ${p.specialty ?? ""}`.toLowerCase();
    return keywords.some(k => haystack.includes(k));
  });
}

export function NearbySpecialists({ flags }: NearbySpecialistsProps) {
  const initialSpecialty = useMemo(() => suggestedSpecialty(flags), [flags]);
  const [specialty, setSpecialty] = useState<string>(initialSpecialty);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(5);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  const filtered = useMemo(() => filterPlaces(places, specialty).sort((a, b) => a.distance - b.distance).slice(0, 30), [places, specialty]);

  // Initialize map once coords are available
  useEffect(() => {
    if (!coords || !mapRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([coords.lat, coords.lon], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstance.current);
      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      // User location marker
      L.circleMarker([coords.lat, coords.lon], {
        radius: 8,
        color: "#0d9488",
        fillColor: "#0d9488",
        fillOpacity: 0.6,
      }).bindPopup("Your location").addTo(mapInstance.current);
    } else {
      mapInstance.current.setView([coords.lat, coords.lon], 13);
    }
  }, [coords]);

  // Update markers when filtered places change
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;
    markersLayer.current.clearLayers();

    const colors: Record<Place["kind"], string> = {
      hospital: "#dc2626",
      clinic: "#2563eb",
      doctor: "#7c3aed",
      pharmacy: "#059669",
    };

    filtered.forEach(p => {
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: 7,
        color: colors[p.kind],
        fillColor: colors[p.kind],
        fillOpacity: 0.8,
        weight: 2,
      });
      const html = `
        <div style="min-width: 180px;">
          <strong>${p.name}</strong><br/>
          <span style="text-transform: capitalize; color: #6b7280; font-size: 12px;">${p.kind}${p.specialty ? ` · ${p.specialty}` : ""}</span><br/>
          <span style="font-size: 12px;">${p.distance.toFixed(1)} km away</span>
          ${p.address ? `<br/><span style="font-size: 12px;">${p.address}</span>` : ""}
          ${p.phone ? `<br/><a href="tel:${p.phone}" style="font-size: 12px;">${p.phone}</a>` : ""}
        </div>`;
      marker.bindPopup(html);
      marker.addTo(markersLayer.current!);
    });

    if (filtered.length > 0 && coords) {
      const bounds = L.latLngBounds([
        [coords.lat, coords.lon],
        ...filtered.map(p => [p.lat, p.lon] as [number, number]),
      ]);
      mapInstance.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [filtered, coords]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const findNearby = () => {
    setError(null);
    setLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not available in your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        try {
          const found = await queryOverpass(lat, lon, radius);
          setPlaces(found);
          if (found.length === 0) {
            setError("No medical facilities found in your area. Try increasing the search radius.");
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to fetch nearby places.");
        } finally {
          setLoading(false);
        }
      },
      err => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please enable it in your browser settings."
            : "Could not determine your location."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const directionsUrl = (p: Place) =>
    `https://www.openstreetmap.org/directions?from=${coords?.lat},${coords?.lon}&to=${p.lat},${p.lon}`;

  return (
    <Card className="shadow-sm print:hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Find Specialists Near You
        </CardTitle>
        <CardDescription>
          Locate hospitals, clinics and doctors near your current location, prioritised for the conditions in your report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!coords && (
          <div className="text-center py-8 px-4 rounded-lg border-2 border-dashed bg-muted/30">
            <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              We'll use your device location to find the best nearby medical facilities. Your location stays in your browser.
            </p>
            <Button onClick={findNearby} disabled={loading} size="lg">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</> : <><Navigation className="mr-2 h-4 w-4" /> Find Specialists Near Me</>}
            </Button>
          </div>
        )}

        {coords && (
          <div className="flex flex-wrap items-center gap-3">
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPECIALTY_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(radius)} onValueChange={v => setRadius(Number(v))}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Within 2 km</SelectItem>
                <SelectItem value="5">Within 5 km</SelectItem>
                <SelectItem value="10">Within 10 km</SelectItem>
                <SelectItem value="20">Within 20 km</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={findNearby} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
            {initialSpecialty !== "all" && specialty === initialSpecialty && (
              <span className="text-xs text-muted-foreground">Suggested for your report</span>
            )}
          </div>
        )}

        {error && (
          <div className="flex gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {coords && (
          <div ref={mapRef} className="w-full h-[360px] rounded-lg border z-0" style={{ background: "#f3f4f6" }} />
        )}

        {filtered.length > 0 && (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
            {filtered.map(p => {
              const accent =
                p.kind === "hospital" ? "border-l-red-500"
                : p.kind === "clinic" ? "border-l-blue-500"
                : p.kind === "doctor" ? "border-l-purple-500"
                : "border-l-emerald-500";
              return (
                <div key={p.id} className={`flex gap-3 p-3 rounded-lg border border-l-4 ${accent} bg-background`}>
                  <div className="mt-1 text-muted-foreground">
                    {p.kind === "hospital" ? <Hospital className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4 className="font-semibold truncate">{p.name}</h4>
                      <span className="text-xs text-muted-foreground capitalize">{p.kind}{p.specialty ? ` · ${p.specialty}` : ""}</span>
                    </div>
                    {p.address && <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.address}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                      <span className="font-medium text-primary">{p.distance.toFixed(1)} km away</span>
                      {p.phone && (
                        <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 text-foreground hover:text-primary">
                          <Phone className="h-3 w-3" /> {p.phone}
                        </a>
                      )}
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground hover:text-primary">
                          <Globe className="h-3 w-3" /> Website
                        </a>
                      )}
                      <a href={directionsUrl(p)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground hover:text-primary">
                        <Navigation className="h-3 w-3" /> Directions
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Listings come from OpenStreetMap and may be incomplete. Always verify credentials, specialties and availability before booking an appointment.
        </p>
      </CardContent>
    </Card>
  );
}
