const API_KEY = process.env.SEOUL_OPEN_DATA_KEY;
const BASE_URL = 'http://openAPI.seoul.go.kr:8088';
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [1_000, 2_000] as const;
const CACHE_TTL_MS = 10 * 60 * 1000;

export type RoadTrafficData = Record<string, unknown>;
export type AccidentControl = Record<string, unknown>;
export type ChargerStation = Record<string, unknown>;
export type BusStop = Record<string, unknown>;
export type CommercialStatus = Record<string, unknown>;
export type SubwayPopulation = Record<string, unknown>;
export type BusPopulation = Record<string, unknown>;
export type DisasterMessage = Record<string, unknown>;
export type NewsItem = Record<string, unknown>;
export type SubwayDetail = Record<string, unknown>;
export type SubwayFacility = Record<string, unknown>;

export interface SeoulCityDataResponse {
  list_total_count: number;
  RESULT: { 'RESULT.CODE': string; 'RESULT.MESSAGE': string };
  CITYDATA: CityData;
}

export interface CityData {
  AREA_NM: string;
  AREA_CD: string;
  LIVE_PPLTN_STTS: PopulationStatus[];
  ROAD_TRAFFIC_STTS: RoadTrafficData;
  PRK_STTS: ParkingLot[];
  WEATHER_STTS: WeatherStatus[];
  SBIKE_STTS: BikeStation[];
  EVENT_STTS: EventInfo[];
  ACDNT_CNTRL_STTS: AccidentControl[];
  CHARGER_STTS: ChargerStation[];
  SUB_STTS: SubwayStation[];
  BUS_STN_STTS: BusStop[];
  LIVE_CMRCL_STTS: CommercialStatus;
  LIVE_SUB_PPLTN: SubwayPopulation;
  LIVE_BUS_PPLTN: BusPopulation;
  LIVE_DST_MESSAGE: DisasterMessage[];
  LIVE_YNA_NEWS: NewsItem[];
}

export interface PopulationStatus {
  AREA_NM: string;
  AREA_CD: string;
  AREA_CONGEST_LVL: '여유' | '보통' | '약간 붐빔' | '붐빔';
  AREA_CONGEST_MSG: string;
  AREA_PPLTN_MIN: string;
  AREA_PPLTN_MAX: string;
  MALE_PPLTN_RATE: string;
  FEMALE_PPLTN_RATE: string;
  PPLTN_RATE_0: string;
  PPLTN_RATE_10: string;
  PPLTN_RATE_20: string;
  PPLTN_RATE_30: string;
  PPLTN_RATE_40: string;
  PPLTN_RATE_50: string;
  PPLTN_RATE_60: string;
  PPLTN_RATE_70: string;
  RESNT_PPLTN_RATE: string;
  NON_RESNT_PPLTN_RATE: string;
  PPLTN_TIME: string;
  FCST_YN: string;
  FCST_PPLTN: PopulationForecast[];
}

export interface PopulationForecast {
  FCST_TIME: string;
  FCST_CONGEST_LVL: string;
  FCST_PPLTN_MIN: string;
  FCST_PPLTN_MAX: string;
}

export interface ParkingLot {
  PRK_NM: string;
  PRK_CD: string;
  PRK_TYPE: string;
  CPCTY: string;
  CUR_PRK_CNT: string;
  CUR_PRK_TIME: string;
  CUR_PRK_YN: string;
  PAY_YN: string;
  RATES: string;
  TIME_RATES: string;
  ADD_RATES: string;
  ADD_TIME_RATES: string;
  ADDRESS: string;
  ROAD_ADDR: string;
  LNG: string;
  LAT: string;
}

export interface WeatherStatus {
  WEATHER_TIME: string;
  TEMP: string;
  SENSIBLE_TEMP: string;
  MAX_TEMP: string;
  MIN_TEMP: string;
  HUMIDITY: string;
  WIND_DIRCT: string;
  WIND_SPD: string;
  PRECIPITATION: string;
  PRECPT_TYPE: string;
  PCP_MSG: string;
  SUNRISE: string;
  SUNSET: string;
  UV_INDEX_LVL: string;
  UV_INDEX: string;
  UV_MSG: string;
  PM25_INDEX: string;
  PM25: string;
  PM10_INDEX: string;
  PM10: string;
  AIR_IDX: string;
  AIR_IDX_MVL: string;
  AIR_IDX_MAIN: string;
  AIR_MSG: string;
  FCST24HOURS: WeatherForecast[];
  NEWS_LIST: NewsItem[];
}

export interface WeatherForecast {
  FCST_DT: string;
  TEMP: string;
  PRECIPITATION: string;
  PRECPT_TYPE: string;
  RAIN_CHANCE: string;
  SKY_STTS: string;
}

export interface BikeStation {
  SBIKE_SPOT_NM: string;
  SBIKE_SPOT_ID: string;
  SBIKE_SHARED: string;
  SBIKE_PARKING_CNT: string;
  SBIKE_RACK_CNT: string;
  SBIKE_X: number;
  SBIKE_Y: number;
}

export interface EventInfo {
  EVENT_NM: string;
  EVENT_PERIOD: string;
  EVENT_PLACE: string;
  EVENT_X: number;
  EVENT_Y: number;
  PAY_YN: string | null;
  THUMBNAIL: string;
  URL: string;
  EVENT_ETC_DETAIL: string | null;
}

export interface SubwayStation {
  SUB_STN_NM: string;
  SUB_STN_LINE: string;
  SUB_STN_RADDR: string;
  SUB_STN_X: string;
  SUB_STN_Y: string;
  SUB_DETAIL: SubwayDetail[];
  SUB_FACIINFO: SubwayFacility[];
}

export interface SeoulArea {
  name: string;
  code: string;
  lat: number;
  lng: number;
  category: '관광특구' | '고궁·문화유산' | '공원' | '발달상권' | '인구밀집지역';
}

interface CityDataCacheEntry {
  data: CityData;
  timestamp: number;
}

const cityDataCache = new Map<string, CityDataCacheEntry>();

export const SEOUL_AREAS: SeoulArea[] = [
  { name: '강남 MICE 관광특구', code: 'POI001', lat: 37.510897, lng: 127.059949, category: '관광특구' },
  { name: '동대문 관광특구', code: 'POI002', lat: 37.567165, lng: 127.01114, category: '관광특구' },
  { name: '명동 관광특구', code: 'POI003', lat: 37.563487, lng: 126.982212, category: '관광특구' },
  { name: '이태원 관광특구', code: 'POI004', lat: 37.534587, lng: 126.995386, category: '관광특구' },
  { name: '잠실 관광특구', code: 'POI005', lat: 37.515875, lng: 127.111837, category: '관광특구' },
  { name: '종로·청계 관광특구', code: 'POI006', lat: 37.570586, lng: 126.996586, category: '관광특구' },
  { name: '홍대 관광특구', code: 'POI007', lat: 37.554829, lng: 126.92166, category: '관광특구' },
  { name: '경복궁', code: 'POI008', lat: 37.57972, lng: 126.976863, category: '고궁·문화유산' },
  { name: '광화문·덕수궁', code: 'POI009', lat: 37.570413, lng: 126.977752, category: '고궁·문화유산' },
  { name: '보신각', code: 'POI010', lat: 37.570577, lng: 126.983207, category: '고궁·문화유산' },
  { name: '서울 암사동 유적', code: 'POI011', lat: 37.560914, lng: 127.130433, category: '고궁·문화유산' },
  { name: '창덕궁·종묘', code: 'POI012', lat: 37.579043, lng: 126.993995, category: '고궁·문화유산' },
  { name: '가산디지털단지역', code: 'POI013', lat: 37.480805, lng: 126.880824, category: '인구밀집지역' },
  { name: '강남역', code: 'POI014', lat: 37.498775, lng: 127.028109, category: '인구밀집지역' },
  { name: '건대입구역', code: 'POI015', lat: 37.540499, lng: 127.068662, category: '인구밀집지역' },
  { name: '고덕역', code: 'POI016', lat: 37.553543, lng: 127.15469, category: '인구밀집지역' },
  { name: '고속터미널역', code: 'POI017', lat: 37.5048, lng: 127.005745, category: '인구밀집지역' },
  { name: '교대역', code: 'POI018', lat: 37.491551, lng: 127.01437, category: '인구밀집지역' },
  { name: '구로디지털단지역', code: 'POI019', lat: 37.484195, lng: 126.896829, category: '인구밀집지역' },
  { name: '구로역', code: 'POI020', lat: 37.502363, lng: 126.881986, category: '인구밀집지역' },
  { name: '군자역', code: 'POI021', lat: 37.556449, lng: 127.080617, category: '인구밀집지역' },
  { name: '대림역', code: 'POI023', lat: 37.492429, lng: 126.89545, category: '인구밀집지역' },
  { name: '동대문역', code: 'POI024', lat: 37.571664, lng: 127.009656, category: '인구밀집지역' },
  { name: '뚝섬역', code: 'POI025', lat: 37.548539, lng: 127.044977, category: '인구밀집지역' },
  { name: '미아사거리역', code: 'POI026', lat: 37.612206, lng: 127.031498, category: '인구밀집지역' },
  { name: '발산역', code: 'POI027', lat: 37.559356, lng: 126.839446, category: '인구밀집지역' },
  { name: '사당역', code: 'POI029', lat: 37.477155, lng: 126.981725, category: '인구밀집지역' },
  { name: '삼각지역', code: 'POI030', lat: 37.535508, lng: 126.973875, category: '인구밀집지역' },
  { name: '서울대입구역', code: 'POI031', lat: 37.480801, lng: 126.952983, category: '인구밀집지역' },
  { name: '서울식물원·마곡나루역', code: 'POI032', lat: 37.567994, lng: 126.83099, category: '인구밀집지역' },
  { name: '서울역', code: 'POI033', lat: 37.556394, lng: 126.973014, category: '인구밀집지역' },
  { name: '선릉역', code: 'POI034', lat: 37.506224, lng: 127.049531, category: '인구밀집지역' },
  { name: '성신여대입구역', code: 'POI035', lat: 37.592524, lng: 127.016802, category: '인구밀집지역' },
  { name: '수유역', code: 'POI036', lat: 37.640798, lng: 127.026489, category: '인구밀집지역' },
  { name: '신논현역·논현역', code: 'POI037', lat: 37.507964, lng: 127.023165, category: '인구밀집지역' },
  { name: '신도림역', code: 'POI038', lat: 37.509021, lng: 126.890131, category: '인구밀집지역' },
  { name: '신림역', code: 'POI039', lat: 37.484308, lng: 126.929738, category: '인구밀집지역' },
  { name: '신촌·이대역', code: 'POI040', lat: 37.556714, lng: 126.939369, category: '인구밀집지역' },
  { name: '양재역', code: 'POI041', lat: 37.48517, lng: 127.033714, category: '인구밀집지역' },
  { name: '역삼역', code: 'POI042', lat: 37.50028, lng: 127.038667, category: '인구밀집지역' },
  { name: '연신내역', code: 'POI043', lat: 37.618534, lng: 126.921685, category: '인구밀집지역' },
  { name: '오목교역·목동운동장', code: 'POI044', lat: 37.530035, lng: 126.878152, category: '인구밀집지역' },
  { name: '왕십리역', code: 'POI045', lat: 37.561948, lng: 127.038639, category: '인구밀집지역' },
  { name: '용산역', code: 'POI046', lat: 37.530152, lng: 126.961324, category: '인구밀집지역' },
  { name: '이태원역', code: 'POI047', lat: 37.534238, lng: 126.992872, category: '인구밀집지역' },
  { name: '장지역', code: 'POI048', lat: 37.479374, lng: 127.122362, category: '인구밀집지역' },
  { name: '장한평역', code: 'POI049', lat: 37.561638, lng: 127.064552, category: '인구밀집지역' },
  { name: '천호역', code: 'POI050', lat: 37.539181, lng: 127.124919, category: '인구밀집지역' },
  { name: '총신대입구(이수)역', code: 'POI051', lat: 37.486373, lng: 126.980875, category: '인구밀집지역' },
  { name: '충정로역', code: 'POI052', lat: 37.559603, lng: 126.963988, category: '인구밀집지역' },
  { name: '합정역', code: 'POI053', lat: 37.549819, lng: 126.911689, category: '인구밀집지역' },
  { name: '혜화역', code: 'POI054', lat: 37.582369, lng: 127.0011, category: '인구밀집지역' },
  { name: '홍대입구역(2호선)', code: 'POI055', lat: 37.556642, lng: 126.923212, category: '인구밀집지역' },
  { name: '회기역', code: 'POI056', lat: 37.590346, lng: 127.056104, category: '인구밀집지역' },
  { name: '가락시장', code: 'POI058', lat: 37.493415, lng: 127.111446, category: '발달상권' },
  { name: '가로수길', code: 'POI059', lat: 37.521639, lng: 127.02314, category: '발달상권' },
  { name: '광장(전통)시장', code: 'POI060', lat: 37.569925, lng: 126.999943, category: '발달상권' },
  { name: '김포공항', code: 'POI061', lat: 37.562571, lng: 126.801018, category: '발달상권' },
  { name: '노량진', code: 'POI063', lat: 37.513726, lng: 126.945349, category: '발달상권' },
  { name: '덕수궁길·정동길', code: 'POI064', lat: 37.566465, lng: 126.972503, category: '발달상권' },
  { name: '북촌한옥마을', code: 'POI066', lat: 37.582906, lng: 126.984515, category: '발달상권' },
  { name: '서촌', code: 'POI067', lat: 37.580155, lng: 126.969015, category: '발달상권' },
  { name: '성수카페거리', code: 'POI068', lat: 37.543039, lng: 127.056881, category: '발달상권' },
  { name: '쌍문역', code: 'POI070', lat: 37.647122, lng: 127.033765, category: '인구밀집지역' },
  { name: '압구정로데오거리', code: 'POI071', lat: 37.525346, lng: 127.040221, category: '발달상권' },
  { name: '여의도', code: 'POI072', lat: 37.525809, lng: 126.927052, category: '발달상권' },
  { name: '연남동', code: 'POI073', lat: 37.561422, lng: 126.922215, category: '발달상권' },
  { name: '영등포 타임스퀘어', code: 'POI074', lat: 37.5167, lng: 126.906759, category: '발달상권' },
  { name: '용리단길', code: 'POI076', lat: 37.531204, lng: 126.971162, category: '발달상권' },
  { name: '이태원 앤틱가구거리', code: 'POI077', lat: 37.531956, lng: 126.993327, category: '발달상권' },
  { name: '인사동', code: 'POI078', lat: 37.5738, lng: 126.986804, category: '발달상권' },
  { name: '창동 신경제 중심지', code: 'POI079', lat: 37.656569, lng: 127.054512, category: '발달상권' },
  { name: '청담동 명품거리', code: 'POI080', lat: 37.526047, lng: 127.043711, category: '발달상권' },
  { name: '청량리 제기동 일대 전통시장', code: 'POI081', lat: 37.580671, lng: 127.040409, category: '발달상권' },
  { name: '해방촌·경리단길', code: 'POI082', lat: 37.54266, lng: 126.988321, category: '발달상권' },
  { name: 'DDP(동대문디자인플라자)', code: 'POI083', lat: 37.567117, lng: 127.010211, category: '발달상권' },
  { name: 'DMC(디지털미디어시티)', code: 'POI084', lat: 37.579767, lng: 126.89206, category: '발달상권' },
  { name: '강서한강공원', code: 'POI085', lat: 37.586091, lng: 126.820015, category: '공원' },
  { name: '고척돔', code: 'POI086', lat: 37.497368, lng: 126.866927, category: '공원' },
  { name: '광나루한강공원', code: 'POI087', lat: 37.549715, lng: 127.133233, category: '공원' },
  { name: '광화문광장', code: 'POI088', lat: 37.573253, lng: 126.976763, category: '공원' },
  { name: '국립중앙박물관·용산가족공원', code: 'POI089', lat: 37.522594, lng: 126.981256, category: '공원' },
  { name: '난지한강공원', code: 'POI090', lat: 37.566572, lng: 126.878061, category: '공원' },
  { name: '남산공원', code: 'POI091', lat: 37.551132, lng: 126.992459, category: '공원' },
  { name: '노들섬', code: 'POI092', lat: 37.517616, lng: 126.958734, category: '공원' },
  { name: '뚝섬한강공원', code: 'POI093', lat: 37.529881, lng: 127.07386, category: '공원' },
  { name: '망원한강공원', code: 'POI094', lat: 37.553278, lng: 126.901004, category: '공원' },
  { name: '반포한강공원', code: 'POI095', lat: 37.510852, lng: 126.993848, category: '공원' },
  { name: '북서울꿈의숲', code: 'POI096', lat: 37.622304, lng: 127.041182, category: '공원' },
  { name: '서리풀공원·몽마르뜨공원', code: 'POI098', lat: 37.49294, lng: 127.00353, category: '공원' },
  { name: '서울광장', code: 'POI099', lat: 37.565644, lng: 126.978089, category: '공원' },
  { name: '서울대공원', code: 'POI100', lat: 37.427676, lng: 127.015878, category: '공원' },
  { name: '서울숲공원', code: 'POI101', lat: 37.544182, lng: 127.035746, category: '공원' },
  { name: '아차산', code: 'POI102', lat: 37.565133, lng: 127.104431, category: '공원' },
  { name: '양화한강공원', code: 'POI103', lat: 37.541355, lng: 126.898264, category: '공원' },
  { name: '어린이대공원', code: 'POI104', lat: 37.549107, lng: 127.081912, category: '공원' },
  { name: '여의도한강공원', code: 'POI105', lat: 37.526841, lng: 126.926568, category: '공원' },
  { name: '월드컵공원', code: 'POI106', lat: 37.569894, lng: 126.882745, category: '공원' },
  { name: '응봉산', code: 'POI107', lat: 37.549161, lng: 127.030096, category: '공원' },
  { name: '이촌한강공원', code: 'POI108', lat: 37.522408, lng: 126.967041, category: '공원' },
  { name: '잠실종합운동장', code: 'POI109', lat: 37.514445, lng: 127.07394, category: '공원' },
  { name: '잠실한강공원', code: 'POI110', lat: 37.520366, lng: 127.084803, category: '공원' },
  { name: '잠원한강공원', code: 'POI111', lat: 37.524334, lng: 127.01498, category: '공원' },
  { name: '청계산', code: 'POI112', lat: 37.442467, lng: 127.052295, category: '공원' },
  { name: '청와대', code: 'POI113', lat: 37.585672, lng: 126.976129, category: '공원' },
  { name: '북창동 먹자골목', code: 'POI114', lat: 37.562185, lng: 126.978777, category: '발달상권' },
  { name: '남대문시장', code: 'POI115', lat: 37.559718, lng: 126.978877, category: '발달상권' },
  { name: '익선동', code: 'POI116', lat: 37.57293, lng: 126.989695, category: '발달상권' },
  { name: '신정네거리역', code: 'POI117', lat: 37.520805, lng: 126.855714, category: '인구밀집지역' },
  { name: '잠실새내역', code: 'POI118', lat: 37.510029, lng: 127.083617, category: '인구밀집지역' },
  { name: '잠실역', code: 'POI119', lat: 37.512302, lng: 127.100444, category: '인구밀집지역' },
  { name: '잠실롯데타워 일대', code: 'POI120', lat: 37.511649, lng: 127.104186, category: '발달상권' },
  { name: '송리단길·호수단길', code: 'POI121', lat: 37.508041, lng: 127.104731, category: '발달상권' },
  { name: '신촌 스타광장', code: 'POI122', lat: 37.556517, lng: 126.936925, category: '발달상권' },
  { name: '보라매공원', code: 'POI123', lat: 37.49335, lng: 126.919842, category: '공원' },
  { name: '서대문독립공원', code: 'POI124', lat: 37.574198, lng: 126.956914, category: '공원' },
  { name: '안양천', code: 'POI125', lat: 37.518825, lng: 126.879572, category: '공원' },
  { name: '여의서로', code: 'POI126', lat: 37.530451, lng: 126.916348, category: '공원' },
  { name: '올림픽공원', code: 'POI127', lat: 37.519122, lng: 127.12187, category: '공원' },
  { name: '홍제폭포', code: 'POI128', lat: 37.58066, lng: 126.936934, category: '공원' },
];

const AREA_BY_NAME = new Map(SEOUL_AREAS.map(area => [area.name, area]));

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCityData(value: unknown): value is CityData {
  if (!isRecord(value)) return false;
  return typeof value.AREA_NM === 'string' && typeof value.AREA_CD === 'string';
}

function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).replace(/[^\d.-]/g, '');
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseInteger(value: string | number | null | undefined): number {
  const parsed = parseNumber(value);
  return parsed === null ? 0 : Math.round(parsed);
}

function decodeParkingType(type: string): string {
  switch (type) {
    case '1':
    case 'NS':
      return '노상';
    case '2':
    case 'NW':
      return '노외';
    case '3':
    case 'BS':
      return '부설';
    default:
      return type || '기타';
  }
}

function decodePayYn(payYn: string): boolean {
  return payYn === 'Y' || payYn === 'y' || payYn === '1' || payYn === '유료';
}

function isCacheFresh(entry: CityDataCacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

function extractApiErrorCode(result: Record<string, unknown> | null): string {
  if (!result) return '';
  const resultCode = result['RESULT.CODE'];
  if (typeof resultCode === 'string') return resultCode;
  const code = result.CODE;
  return typeof code === 'string' ? code : '';
}

function resolveResponseEnvelope(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;

  if (
    Object.prototype.hasOwnProperty.call(payload, 'CITYDATA') ||
    Object.prototype.hasOwnProperty.call(payload, 'list_total_count')
  ) {
    return payload;
  }

  const direct = payload.citydata;
  if (isRecord(direct)) {
    return direct;
  }

  for (const value of Object.values(payload)) {
    if (!isRecord(value)) continue;
    if (
      Object.prototype.hasOwnProperty.call(value, 'row') ||
      Object.prototype.hasOwnProperty.call(value, 'CITYDATA')
    ) {
      return value;
    }
  }

  return null;
}

function parseCityData(payload: unknown): CityData | null {
  const envelope = resolveResponseEnvelope(payload);
  if (!envelope) return null;

  const result = isRecord(envelope.RESULT) ? envelope.RESULT : null;
  const resultCode = extractApiErrorCode(result);
  if (resultCode && resultCode !== 'INFO-000') {
    throw new Error(`Seoul citydata API error: ${resultCode}`);
  }

  const cityDataValue = envelope.CITYDATA;
  if (isCityData(cityDataValue)) {
    return cityDataValue;
  }

  const rowValue = envelope.row;
  if (Array.isArray(rowValue)) {
    const first = rowValue[0];
    if (isCityData(first)) {
      return first;
    }
  }

  if (isCityData(envelope)) {
    return envelope;
  }

  return null;
}

function calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusMeters = 6_371_000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

export async function fetchCityData(areaName: string): Promise<CityData | null> {
  const cached = cityDataCache.get(areaName);
  if (cached && isCacheFresh(cached)) {
    return cached.data;
  }

  if (!API_KEY) {
    console.error('SEOUL_OPEN_DATA_KEY is missing');
    return cached?.data ?? null;
  }

  const url = `${BASE_URL}/${API_KEY}/json/citydata/1/5/${encodeURIComponent(areaName)}`;
  let lastError: unknown;

  for (let retryCount = 0; retryCount <= MAX_RETRIES; retryCount++) {
    const attempt = retryCount + 1;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch city data API: ${res.status}`);
      }

      const text = await res.text();
      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error(`City data API returned non-JSON response: ${text.slice(0, 200)}`);
      }

      const cityData = parseCityData(payload);
      if (!cityData) {
        throw new Error(`City data missing for area: ${areaName}`);
      }

      cityDataCache.set(areaName, {
        data: cityData,
        timestamp: Date.now(),
      });

      return cityData;
    } catch (error) {
      lastError = error;
      console.error(`City data API attempt ${attempt} failed:`, error);

      if (retryCount < MAX_RETRIES) {
        await wait(RETRY_DELAYS_MS[retryCount]);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (cached) {
    console.warn(`Serving stale city data for ${areaName} from in-memory cache after API failures`);
    return cached.data;
  }

  console.error(`Error fetching city data for ${areaName}:`, lastError);
  throw lastError;
}

export function getCachedCityData(areaName: string): CityData | null {
  return cityDataCache.get(areaName)?.data ?? null;
}

export interface NearestAreaResult {
  area: SeoulArea;
  /** Distance in meters between the query point and the matched area */
  distanceMeters: number;
}

export function findNearestArea(lat: number, lng: number): NearestAreaResult | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  let nearest: SeoulArea | null = null;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const area of SEOUL_AREAS) {
    const distance = calculateDistanceMeters(lat, lng, area.lat, area.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = area;
    }
  }

  if (!nearest) return null;

  return { area: nearest, distanceMeters: minDistance };
}

export function findNearestAreas(lat: number, lng: number, count = 5): SeoulArea[] {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || count <= 0) {
    return [];
  }

  return [...SEOUL_AREAS]
    .sort(
      (a, b) =>
        calculateDistanceMeters(lat, lng, a.lat, a.lng) -
        calculateDistanceMeters(lat, lng, b.lat, b.lng)
    )
    .slice(0, count);
}

export interface CityWeatherInfo {
  temp: number;
  sensibleTemp: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: string;
  precipType: string;
  pcpMsg: string;
  sunrise: string;
  sunset: string;
  uvIndex: string;
  uvIndexLevel: string;
  uvMsg: string;
  pm25: number | null;
  pm25Index: string;
  pm10: number | null;
  pm10Index: string;
  airIndex: string;
  airIndexValue: number | null;
  airIndexMain: string;
  airMsg: string;
  sky: string | null;
  forecast24h: { time: string; temp: number; rainChance: number; sky: string; precipitation: string }[];
  weatherTime: string;
}

export interface CityParkingInfo {
  name: string;
  type: string;
  capacity: number;
  payYn: boolean;
  rates: number;
  timeRates: number;
  addRates: number;
  addTimeRates: number;
  address: string;
  lat: number;
  lng: number;
}

export interface CityCongestionInfo {
  level: '여유' | '보통' | '약간 붐빔' | '붐빔';
  message: string;
  populationMin: number;
  populationMax: number;
  populationTime: string;
  forecast: { time: string; level: string; min: number; max: number }[];
}

export function extractWeather(cityData: CityData): CityWeatherInfo | null {
  const weather = cityData.WEATHER_STTS?.[0];
  if (!weather) return null;

  const temp = parseNumber(weather.TEMP);
  const sensibleTemp = parseNumber(weather.SENSIBLE_TEMP);
  const humidity = parseNumber(weather.HUMIDITY);
  const windSpeed = parseNumber(weather.WIND_SPD);

  return {
    temp: temp ?? 0,
    sensibleTemp: sensibleTemp ?? 0,
    humidity: humidity ?? 0,
    windSpeed: windSpeed ?? 0,
    windDirection: weather.WIND_DIRCT,
    precipitation: weather.PRECIPITATION,
    precipType: weather.PRECPT_TYPE,
    pcpMsg: weather.PCP_MSG,
    sunrise: weather.SUNRISE,
    sunset: weather.SUNSET,
    uvIndex: weather.UV_INDEX,
    uvIndexLevel: weather.UV_INDEX_LVL,
    uvMsg: weather.UV_MSG,
    pm25: parseNumber(weather.PM25),
    pm25Index: weather.PM25_INDEX,
    pm10: parseNumber(weather.PM10),
    pm10Index: weather.PM10_INDEX,
    airIndex: weather.AIR_IDX,
    airIndexValue: parseNumber(weather.AIR_IDX_MVL),
    airIndexMain: weather.AIR_IDX_MAIN,
    airMsg: weather.AIR_MSG,
    sky: weather.PRECPT_TYPE || null,
    forecast24h: (weather.FCST24HOURS ?? []).map(item => ({
      time: item.FCST_DT,
      temp: parseNumber(item.TEMP) ?? 0,
      rainChance: parseInteger(item.RAIN_CHANCE),
      sky: item.SKY_STTS,
      precipitation: item.PRECIPITATION,
    })),
    weatherTime: weather.WEATHER_TIME,
  };
}

export function extractParking(cityData: CityData): CityParkingInfo[] {
  return (cityData.PRK_STTS ?? []).map(item => ({
    name: item.PRK_NM,
    type: decodeParkingType(item.PRK_TYPE),
    capacity: parseInteger(item.CPCTY),
    payYn: decodePayYn(item.PAY_YN),
    rates: parseInteger(item.RATES),
    timeRates: parseInteger(item.TIME_RATES),
    addRates: parseInteger(item.ADD_RATES),
    addTimeRates: parseInteger(item.ADD_TIME_RATES),
    address: item.ROAD_ADDR || item.ADDRESS,
    lat: parseNumber(item.LAT) ?? 0,
    lng: parseNumber(item.LNG) ?? 0,
  }));
}

export function extractCongestion(cityData: CityData): CityCongestionInfo | null {
  const population = cityData.LIVE_PPLTN_STTS?.[0];
  if (!population) return null;

  return {
    level: population.AREA_CONGEST_LVL,
    message: population.AREA_CONGEST_MSG,
    populationMin: parseInteger(population.AREA_PPLTN_MIN),
    populationMax: parseInteger(population.AREA_PPLTN_MAX),
    populationTime: population.PPLTN_TIME,
    forecast: (population.FCST_PPLTN ?? []).map(item => ({
      time: item.FCST_TIME,
      level: item.FCST_CONGEST_LVL,
      min: parseInteger(item.FCST_PPLTN_MIN),
      max: parseInteger(item.FCST_PPLTN_MAX),
    })),
  };
}

export function getAreaByName(areaName: string): SeoulArea | null {
  return AREA_BY_NAME.get(areaName) ?? null;
}
