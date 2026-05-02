const TaxiPatternBackground = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern
          id="taxiPattern"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          {/* Taxi */}
          <path
            d="M30,10 L40,10 L45,20 L45,30 L15,30 L15,20 L20,10 L30,10"
            fill="#FBBF24"
          />
          {/* Windows */}
          <rect x="22" y="15" width="6" height="5" fill="#F3F4F6" />
          <rect x="32" y="15" width="6" height="5" fill="#F3F4F6" />
          {/* Wheels */}
          <circle cx="20" cy="30" r="5" fill="#374151" />
          <circle cx="40" cy="30" r="5" fill="#374151" />
          {/* Taxi sign */}
          <rect x="28" y="8" width="4" height="2" fill="#FBBF24" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#taxiPattern)" />
      </svg>
    </div>
  );
};

export default TaxiPatternBackground;
