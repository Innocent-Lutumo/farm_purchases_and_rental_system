// Entry point: App.tsx or App.jsx
import React from "react";
import { MapPin } from "lucide-react";

// Inline versions of Card, CardContent, and Button components

function Card({ children, className }) {
  return <div className={`bg-white border rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

function CardContent({ children, className }) {
  return <div className={className}>{children}</div>;
}

function Button({ children, onClick, variant = "default" }) {
  const baseStyle = "px-4 py-2 rounded-xl text-white font-medium";
  const styles = {
    default: `${baseStyle} bg-green-600 hover:bg-green-700`,
    outline: `${baseStyle} bg-white border border-green-600 text-green-600 hover:bg-green-50`,
  };
  return (
    <button onClick={onClick} className={styles[variant]}>
      {children}
    </button>
  );
}

const farms = [
  {
    id: 1,
    title: "Green Valley Farm",
    type: "Rent",
    price: "$500/month",
    location: "Kajiado County, Kenya",
    lat: -1.853,
    lng: 36.776,
    image: "https://source.unsplash.com/featured/?farm,1"
  },
  {
    id: 2,
    title: "Golden Fields",
    type: "Purchase",
    price: "$15,000",
    location: "Nakuru, Kenya",
    lat: -0.303,
    lng: 36.080,
    image: "https://source.unsplash.com/featured/?farm,2"
  }
];

export default function Appp() {

  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">🌾 Farm Purchase & Rental System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {farms.map((farm) => (
          <Card key={farm.id} className="hover:shadow-xl">
            <CardContent className="p-4 space-y-2">
              <img src={farm.image} alt={farm.title} className="w-full h-48 object-cover rounded-lg" />
              <h2 className="text-xl font-semibold">{farm.title}</h2>
              <p>Type: {farm.type}</p>
              <p>Price: {farm.price}</p>
              <p>Location: {farm.location}</p>
              <div className="flex gap-2">
                <Button onClick={() => openNavigation(farm.lat, farm.lng)}>
                  <MapPin className="mr-2" /> Navigate
                </Button>
                <Button variant="outline">{farm.type === 'Rent' ? 'Rent Now' : 'Buy Now'}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
