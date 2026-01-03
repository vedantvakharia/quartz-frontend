// Mock data for testing search functionality
// This file provides sample site data when API is unavailable

export const mockSites = [
  {
    site_uuid: "site-001",
    client_name: "Test Client A",
    client_site_id: "CLIENT_001",
    client_site_name: "Solar Farm East",
    region: "East England",
    dno: '{"dno_id": "10", "long_name": "UKPN (East)"}',
    gsp: '{"gsp_id": "214", "name": "PELH"}',
    orientation: "180",
    tilt: "35",
    latitude: 52.2053,
    longitude: 0.1218,
    inverter_capacity_kw: 500,
    module_capacity_kw: 600
  },
  {
    site_uuid: "site-002",
    client_name: "Test Client B",
    client_site_id: "CLIENT_002",
    client_site_name: "West Midlands Solar",
    region: "West Midlands",
    dno: '{"dno_id": "11", "long_name": "Western Power (West Midlands)"}',
    gsp: '{"gsp_id": "215", "name": "SOUT"}',
    orientation: "180",
    tilt: "35",
    latitude: 52.4862,
    longitude: -1.8904,
    inverter_capacity_kw: 750,
    module_capacity_kw: 850
  },
  {
    site_uuid: "site-003",
    client_name: "Test Client C",
    client_site_id: "CLIENT_003",
    client_site_name: "London Solar Array",
    region: "London",
    dno: '{"dno_id": "20", "long_name": "UKPN (London)"}',
    gsp: '{"gsp_id": "216", "name": "LOND"}',
    orientation: "180",
    tilt: "30",
    latitude: 51.5074,
    longitude: -0.1278,
    inverter_capacity_kw: 1000,
    module_capacity_kw: 1200
  },
  {
    site_uuid: "site-004",
    client_name: "Test Client D",
    client_site_id: "CLIENT_004",
    client_site_name: "Yorkshire Energy Park",
    region: "Yorkshire",
    dno: '{"dno_id": "12", "long_name": "Northern Powergrid (Yorkshire)"}',
    gsp: '{"gsp_id": "217", "name": "YORK"}',
    orientation: "180",
    tilt: "35",
    latitude: 53.8008,
    longitude: -1.5491,
    inverter_capacity_kw: 850,
    module_capacity_kw: 1000
  },
  {
    site_uuid: "site-005",
    client_name: "Test Client E",
    client_site_id: "CLIENT_005",
    client_site_name: "Scotland Solar Fields",
    region: "Scotland",
    dno: '{"dno_id": "13", "long_name": "Scottish Power (Central Scotland)"}',
    gsp: '{"gsp_id": "218", "name": "SCOT"}',
    orientation: "180",
    tilt: "40",
    latitude: 55.9533,
    longitude: -3.1883,
    inverter_capacity_kw: 600,
    module_capacity_kw: 700
  }
];

// Use a fixed base timestamp to prevent hydration errors
// This ensures server and client render the same timestamps
const FIXED_BASE_TIME = new Date("2024-01-15T12:00:00Z").getTime();

export const mockForecastData = mockSites.flatMap((site, siteIndex) => ({
  site_uuid: site.site_uuid,
  forecast_uuid: `forecast-${site.site_uuid}`,
  forecast_creation_datetime: new Date(FIXED_BASE_TIME).toISOString(),
  forecast_version: "1.0",
  forecast_values: Array.from({ length: 48 }, (_, i) => {
    // Create timestamps at 30-minute intervals (24 back, 24 forward from base time)
    const targetTime = new Date(FIXED_BASE_TIME + (i - 24) * 30 * 60 * 1000);

    // Use deterministic values to avoid hydration errors
    // Generate values between 5-70% of capacity based on site and time index
    const generationFactor = 0.05 + ((siteIndex * 7 + i * 3) % 65) / 100;

    return {
      target_datetime_utc: targetTime.toISOString(),
      expected_generation_kw: site.inverter_capacity_kw * generationFactor
    };
  })
}));

export const mockActualData = mockSites.map((site, siteIndex) => ({
  site_uuid: site.site_uuid,
  pv_actual_values: Array.from({ length: 48 }, (_, i) => {
    // Create timestamps at 30-minute intervals going back from base time
    const datetime = new Date(FIXED_BASE_TIME - (48 - i) * 30 * 60 * 1000);

    // Use deterministic values to avoid hydration errors
    // Generate values between 5-60% of capacity based on site and time index
    const generationFactor = 0.05 + ((siteIndex * 5 + i * 2) % 55) / 100;

    return {
      datetime_utc: datetime.toISOString(),
      actual_generation_kw: site.inverter_capacity_kw * generationFactor
    };
  })
}));
