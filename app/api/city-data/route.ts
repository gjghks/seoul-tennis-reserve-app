import { NextRequest, NextResponse } from 'next/server';
import {
  extractCongestion,
  extractParking,
  extractWeather,
  fetchCityData,
  findNearestArea,
  getAreaByName,
} from '@/lib/seoulCityDataApi';
import { createRateLimiter } from '@/lib/rateLimit';

export const revalidate = 300;

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });
const DEFAULT_FIELDS = ['weather', 'parking', 'congestion'] as const;

type SupportedField = (typeof DEFAULT_FIELDS)[number];

function parseFields(fieldsParam: string | null): SupportedField[] {
  if (!fieldsParam) {
    return [...DEFAULT_FIELDS];
  }

  const selected = new Set<SupportedField>();
  for (const field of fieldsParam.split(',')) {
    const normalized = field.trim().toLowerCase();
    if (normalized === 'weather' || normalized === 'parking' || normalized === 'congestion') {
      selected.add(normalized);
    }
  }

  return selected.size > 0 ? [...selected] : [...DEFAULT_FIELDS];
}

function parseUpdatedAt(weatherTime: string | undefined, populationTime: string | undefined): string {
  const source = weatherTime || populationTime;
  if (!source) return new Date().toISOString();

  const normalized = source.replace(' ', 'T');
  const timestamp = Date.parse(normalized);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date().toISOString();
}

export async function GET(request: NextRequest) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const areaParam = searchParams.get('area')?.trim() ?? '';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const fields = parseFields(searchParams.get('fields'));

  const lat = latParam !== null ? Number.parseFloat(latParam) : Number.NaN;
  const lng = lngParam !== null ? Number.parseFloat(lngParam) : Number.NaN;
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  let areaName = areaParam;
  let matchedAreaDistanceMeters: number | null = null;
  if (hasCoordinates) {
    const nearest = findNearestArea(lat, lng);
    if (!nearest) {
      return NextResponse.json({ error: 'Unable to resolve nearest area from coordinates' }, { status: 400 });
    }
    areaName = nearest.area.name;
    matchedAreaDistanceMeters = nearest.distanceMeters;
  }

  if (!areaName) {
    return NextResponse.json(
      { error: 'Query parameter `area` or both `lat` and `lng` are required' },
      { status: 400 }
    );
  }

  try {
    const cityData = await fetchCityData(areaName);
    if (!cityData) {
      return NextResponse.json({ error: 'No city data available for the requested area' }, { status: 404 });
    }

    const weather = extractWeather(cityData);
    const congestion = extractCongestion(cityData);
    const parking = extractParking(cityData);
    const knownArea = getAreaByName(cityData.AREA_NM) ?? getAreaByName(areaName);

    const response: {
      area: string;
      areaCode: string;
      updatedAt: string;
      matchedAreaDistance?: number;
      weather?: ReturnType<typeof extractWeather>;
      parking?: ReturnType<typeof extractParking>;
      congestion?: ReturnType<typeof extractCongestion>;
    } = {
      area: cityData.AREA_NM || areaName,
      areaCode: cityData.AREA_CD || knownArea?.code || '',
      updatedAt: parseUpdatedAt(weather?.weatherTime, congestion?.populationTime),
    };

    if (matchedAreaDistanceMeters !== null) {
      response.matchedAreaDistance = Math.round(matchedAreaDistanceMeters);
    }

    if (fields.includes('weather')) {
      response.weather = weather;
    }
    if (fields.includes('parking')) {
      response.parking = parking;
    }
    if (fields.includes('congestion')) {
      response.congestion = congestion;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching city data:', error);
    return NextResponse.json({ error: 'Failed to fetch city data' }, { status: 500 });
  }
}
