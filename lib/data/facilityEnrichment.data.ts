import type { FacilityEnrichment } from './facilityEnrichment.types';

const FACILITY_DATA: FacilityEnrichment[] = [
  {
    "facilityName": "삼청 테니스장",
    "normalizedName": "삼청",
    "district": "종로구",
    "address": "삼청동 산2-1",
    "courtCount": 6,
    "surfaces": [
      {
        "type": "클레이",
        "count": 4
      },
      {
        "type": "하드",
        "count": 2
      }
    ],
    "surfaceCategory": "mixed",
    "surfaceDisplay": "클레이 4면, 하드 2면",
    "area": 3774,
    "siteArea": 5238,
    "builtYear": 1996,
    "owner": "종로구",
    "manager": "종로구시설관리공단",
    "contact": "종로구시설관리공단 (745-6701~5)",
    "website": "www.ijongno.co.kr",
    "indoorOutdoor": null,
    "lighting": {
      "count": 9,
      "lux": 500
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "장충 테니스장",
    "normalizedName": "장충",
    "district": "중구",
    "address": "장충동2가200-102",
    "courtCount": 9,
    "surfaces": [
      {
        "type": "우레탄",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "우레탄",
    "area": 7603,
    "siteArea": 10545,
    "builtYear": 1974,
    "owner": "서울시",
    "manager": "중부공원여가센터",
    "contact": "서울시시설관리사업소",
    "website": "stadium.seoul.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": 2000,
    "renovation": "1974"
  },
  {
    "facilityName": "손기정체육공원 테니스장",
    "normalizedName": "손기정체육공원",
    "district": "중구",
    "address": "서울 중구 만리동2가 10-82",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1343,
    "siteArea": 7371,
    "builtYear": null,
    "owner": "중구",
    "manager": "중구 시설관리공단",
    "contact": "중구시설관리공단",
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": 16,
    "renovation": null,
    "longitude": 126.9650,
    "latitude": 37.5553
  },
  {
    "facilityName": "한강시민공원 이촌지구 테니스장",
    "normalizedName": "한강시민공원이촌지구",
    "district": "용산구",
    "address": null,
    "courtCount": 8,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 2086,
    "siteArea": 3793,
    "builtYear": 1991,
    "owner": "서울시",
    "manager": "미래한강본부",
    "contact": "서울시한강시민공원사업소(3780-0777~8)",
    "website": "hangang.seoul.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "응봉근린공원 한남테니스장",
    "normalizedName": "응봉근린공원한남",
    "district": "용산구",
    "address": null,
    "courtCount": 12,
    "surfaces": [
      {
        "type": "클레이",
        "count": 6
      },
      {
        "type": "인조잔디",
        "count": 6
      }
    ],
    "surfaceCategory": "mixed",
    "surfaceDisplay": "클레이 6면, 인조잔디 6면",
    "area": 8776,
    "siteArea": 8776,
    "builtYear": 1999,
    "owner": "서울시",
    "manager": "용산구",
    "contact": "서울시한강시민공원사업소(3780-0777~8)",
    "website": "hangang.seoul.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "뚝섬 서울숲 테니스장",
    "normalizedName": "뚝섬서울숲",
    "district": "성동구",
    "address": "성수1가 1동685-20",
    "courtCount": 5,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 2665,
    "siteArea": 2665,
    "builtYear": 2005,
    "owner": "서울시",
    "manager": "동부공원여가센터",
    "contact": "서울시시설관리사업소",
    "website": "stadium.seoul.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "중랑물재생센터 테니스장",
    "normalizedName": "중랑물재생센터",
    "district": "성동구",
    "address": "자동차시장3길 64",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1400,
    "siteArea": 1400,
    "builtYear": 1993,
    "owner": "서울시",
    "manager": "중랑물재생센터",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "마장 테니스장",
    "normalizedName": "마장",
    "district": "성동구",
    "address": "마장동 832",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1120,
    "siteArea": 1339,
    "builtYear": 2007,
    "owner": "성동구",
    "manager": "성동구도시관리공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "응봉 테니스장",
    "normalizedName": "응봉",
    "district": "성동구",
    "address": "응봉동 237-1",
    "courtCount": 5,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 2568,
    "siteArea": 2568,
    "builtYear": 2009,
    "owner": "성동구",
    "manager": "성동구도시관리공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "응봉공원(대현산배수지) 테니스장",
    "normalizedName": "응봉공원",
    "district": "성동구",
    "address": null,
    "courtCount": 2,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1200,
    "siteArea": 1200,
    "builtYear": 2003,
    "owner": "서울시",
    "manager": "동부공원여가센터",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "한강시민공원 뚝섬지구테니스장",
    "normalizedName": "한강시민공원뚝섬지구",
    "district": "광진구",
    "address": null,
    "courtCount": 4,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 2680,
    "siteArea": 2680,
    "builtYear": 1991,
    "owner": "서울시",
    "manager": "미래한강본부",
    "contact": "서울시한강시민공원사업소(3780-0777~8)",
    "website": "hangang.seoul.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "아차산배수지체육공원 테니스장",
    "normalizedName": "아차산배수지체육공원",
    "district": "광진구",
    "address": "천호대로 731",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 4752,
    "siteArea": 4752,
    "builtYear": 1998,
    "owner": "서울시",
    "manager": "광진구시설관리공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": {
      "count": 3,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "어린이대공원 테니스장",
    "normalizedName": "어린이대공원",
    "district": "광진구",
    "address": "구의동 산25-1",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 2398,
    "siteArea": 2398,
    "builtYear": 1973,
    "owner": "서울시",
    "manager": "서울시설관리공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": {
      "count": 3,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },

  {
    "facilityName": "이문체육문화센터 테니스장",
    "normalizedName": "이문체육문화센터",
    "district": "동대문구",
    "address": "한천로58길 81-49 (이문동)",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1332,
    "siteArea": 1332,
    "builtYear": 2005,
    "owner": "한국철도공사",
    "manager": "동대문 시설관리공단",
    "contact": "02-963-0534",
    "website": "www.dfmc.kr:8443/course/sports/fmcs/14",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": "2025.10~2026.02 노후시설개선공사 완료 (인조잔디 전면교체, 우배수로, 펜스, 휴게컨테이너)"
  },
  {
    "facilityName": "중랑천 제1체육공원 테니스장",
    "normalizedName": "중랑천제1체육공원",
    "district": "동대문구",
    "address": "장안벚꽃로 74 (장안동)",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1230,
    "siteArea": 1230,
    "builtYear": 2018,
    "owner": "동대문구",
    "manager": "동대문 시설관리공단",
    "contact": "동대문구시설관리공단",
    "website": "www.dfmc.kr:8443/course/sports/fmcs/14",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "중랑IC 테니스장",
    "normalizedName": "중랑ic",
    "district": "중랑구",
    "address": "중랑구 신내동 3",
    "courtCount": 8,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 5103,
    "siteArea": 5829,
    "builtYear": 2018,
    "owner": "중랑구",
    "manager": "중랑구 시설관리공단",
    "contact": "중랑구 시설관리공단",
    "website": "https://jnrent2.jungnangimc.or.kr/page/rent/s01.od.list.php",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "용마폭포공원테니스장",
    "normalizedName": "용마폭포공원",
    "district": "중랑구",
    "address": "서울시 중랑구 용마산로250-12 (면목동)",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 5103,
    "siteArea": 1506,
    "builtYear": 2018,
    "owner": "중랑구",
    "manager": "중랑구 시설관리공단",
    "contact": null,
    "website": "https://jnrent2.jungnangimc.or.kr/page/rent/s02.od.list.php",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "면목구립테니스장",
    "normalizedName": "면목구립테니스장",
    "district": "중랑구",
    "address": "중랑구 면목동 727-94",
    "courtCount": 5,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 3635,
    "siteArea": 3635,
    "builtYear": null,
    "owner": "중랑구",
    "manager": "중랑구시설관리공단",
    "contact": "070-8824-3599",
    "website": "https://tennis.jungnangimc.or.kr",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "월곡테니스장",
    "normalizedName": "월곡",
    "district": "성북구",
    "address": "화랑로13길 144",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      },
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "mixed",
    "surfaceDisplay": "인조잔디, 클레이",
    "area": 1782,
    "siteArea": 1782,
    "builtYear": null,
    "owner": "성북구",
    "manager": "성북구테니스연합회",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "정릉체육시설",
    "normalizedName": "정릉체육시설",
    "district": "성북구",
    "address": "정릉동 산87-357",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 4035,
    "siteArea": 4035,
    "builtYear": 2011,
    "owner": "성북구",
    "manager": "성북구도시관리공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "오동근린공원 테니스장",
    "normalizedName": "오동근린공원",
    "district": "강북구",
    "address": "서울특별시 강북구 월계로 191-40 (번동)",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1100,
    "siteArea": 2142,
    "builtYear": 2019,
    "owner": "강북구",
    "manager": "강북구테니스협회",
    "contact": "010-9976-3143",
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "다락원체육공원 테니스장",
    "normalizedName": "다락원체육공원",
    "district": "도봉구",
    "address": "서울시 도봉구 창포원로 45 다락원체육공원",
    "courtCount": 8,
    "surfaces": [
      {
        "type": "케미칼",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "케미칼",
    "area": 3120,
    "siteArea": 49830,
    "builtYear": 2018,
    "owner": "서울시",
    "manager": "도봉구시설관리공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "마들스포츠타운 테니스장",
    "normalizedName": "마들스포츠타운",
    "district": "노원구",
    "address": "서울특별시 노원구 덕릉로 450",
    "courtCount": 9,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 4640,
    "siteArea": 4640,
    "builtYear": 1991,
    "owner": "노원구",
    "manager": "노원구서비스공단",
    "contact": "02-2289-6855",
    "website": "https://reservation.nowonsc.kr/sports/tennis_list",
    "indoorOutdoor": "outdoor",
    "lighting": {
      "count": 6,
      "lux": 400
    },
    "spectatorSeats": null,
    "renovation": "2002"
  },
  {
    "facilityName": "초안산스포츠타운 테니스장",
    "normalizedName": "초안산스포츠타운",
    "district": "노원구",
    "address": "서울특별시 노원구 마들로 5가길 113",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 2340,
    "siteArea": 2340,
    "builtYear": 2001,
    "owner": "노원구",
    "manager": "노원구서비스공단",
    "contact": "02-2289-6855",
    "website": "https://reservation.nowonsc.kr/sports/tennis_list",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "불암산스포츠타운 테니스장",
    "normalizedName": "불암산스포츠타운",
    "district": "노원구",
    "address": "서울특별시 노원구 중계로 36",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1900,
    "siteArea": 38000,
    "builtYear": 2009,
    "owner": "서울시",
    "manager": "노원구서비스공단",
    "contact": "02-2289-6855",
    "website": "https://reservation.nowonsc.kr/sports/tennis_list",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "수락산스포츠타운 테니스장",
    "normalizedName": "수락산스포츠타운",
    "district": "노원구",
    "address": "서울특별시 노원구 수락산로8길 39",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1740,
    "siteArea": 1740,
    "builtYear": 2022,
    "owner": "노원구",
    "manager": "노원구서비스공단",
    "contact": "02-2289-6855",
    "website": "https://reservation.nowonsc.kr/sports/tennis_list",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "은평구민체육센터 테니스장",
    "normalizedName": "은평구민체육센터",
    "district": "은평구",
    "address": "은평구 진관1로 40",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 833,
    "siteArea": 9988,
    "builtYear": 2003,
    "owner": "은평구",
    "manager": "은평구시설관리공단",
    "contact": "02-350-5393",
    "website": "https://www.efmc.or.kr/fmcs/14",
    "indoorOutdoor": "outdoor",
    "lighting": {
      "count": 4,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "북한산근린공원 테니스장",
    "normalizedName": "북한산근린공원",
    "district": "은평구",
    "address": "서울특별시 은평구 진흥로 300 (녹번동)",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1035,
    "siteArea": 1035,
    "builtYear": null,
    "owner": "은평구",
    "manager": "은평구시설관리공단",
    "contact": "02-350-5358",
    "website": "https://www.efmc.or.kr/fmcs/441",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "서오릉근린공원 선정테니스장",
    "normalizedName": "선정테니스장",
    "district": "은평구",
    "address": "서울 은평구 갈현동 228-100",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1750,
    "siteArea": 1750,
    "builtYear": 2024,
    "owner": "은평구",
    "manager": "은평구시설관리공단",
    "contact": "02-350-5236",
    "website": "https://www.efmc.or.kr/fmcs/761",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "홍은동 테니스장",
    "normalizedName": "홍은동",
    "district": "서대문구",
    "address": null,
    "courtCount": 2,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1564,
    "siteArea": 1564,
    "builtYear": 1991,
    "owner": "서대문구",
    "manager": "서대문구테니스연합회",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "현저동 테니스장",
    "normalizedName": "현저동",
    "district": "서대문구",
    "address": null,
    "courtCount": 2,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1200,
    "siteArea": 1200,
    "builtYear": 1991,
    "owner": "서대문구",
    "manager": "서대문구테니스연합회",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "가좌 테니스장",
    "normalizedName": "가좌",
    "district": "서대문구",
    "address": null,
    "courtCount": 2,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1465,
    "siteArea": 1465,
    "builtYear": 2000,
    "owner": "서대문구",
    "manager": "서대문구테니스연합회",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "한강공원 망원지구 테니스장",
    "normalizedName": "한강공원망원지구",
    "district": "마포구",
    "address": null,
    "courtCount": 6,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1304,
    "siteArea": 1304,
    "builtYear": 2009,
    "owner": "서울시",
    "manager": "미래한강본부",
    "contact": "서울시한강시민공원사업소(3780-0777~8)",
    "website": "hangang.seoul.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "망원나들목 테니스장",
    "normalizedName": "망원나들목",
    "district": "마포구",
    "address": null,
    "courtCount": 4,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 2105,
    "siteArea": 2338,
    "builtYear": 2020,
    "owner": "서울시",
    "manager": "마포테니스연합회",
    "contact": null,
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "월드컵공원테니스장",
    "normalizedName": "월드컵공원",
    "district": "마포구",
    "address": null,
    "courtCount": 2,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1800,
    "siteArea": 2261,
    "builtYear": 2002,
    "owner": "서울시",
    "manager": "서부공원여가센터",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "난지물재생센터 테니스장",
    "normalizedName": "난지물재생센터",
    "district": "고양시 덕양구",
    "address": "경기도 고양시 덕양구 대덕로426",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 2500,
    "siteArea": 2500,
    "builtYear": 2011,
    "owner": "서울시",
    "manager": "난지물재생센터",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "목동 테니스장",
    "normalizedName": "목동",
    "district": "양천구",
    "address": "목동915번지",
    "courtCount": 18,
    "surfaces": [
      {
        "type": "하드",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "하드",
    "area": 16658,
    "siteArea": 16658,
    "builtYear": 2002,
    "owner": "양천구",
    "manager": "양천구 시설관리공단",
    "contact": "02)2643-0686",
    "website": "sisul.yangchon.seoul.kr",
    "indoorOutdoor": "outdoor",
    "lighting": {
      "count": 2,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "우장 테니스장",
    "normalizedName": "우장",
    "district": "강서구",
    "address": "화곡동 산60-1",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 4000,
    "siteArea": 4000,
    "builtYear": 1990,
    "owner": "서울시",
    "manager": "강서구",
    "contact": "강서구(2600-6561)",
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "구립 테니스장",
    "normalizedName": "구립",
    "district": "강서구",
    "address": "방화동 36-14 일대",
    "courtCount": 6,
    "surfaces": [
      {
        "type": "아크릴케미칼",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "아크릴케미칼",
    "area": 22690,
    "siteArea": 22690,
    "builtYear": 2002,
    "owner": "강서구",
    "manager": "강서구",
    "contact": "강서구(2600-6579)",
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": {
      "count": 8,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "수명산 테니스장",
    "normalizedName": "수명산",
    "district": "강서구",
    "address": null,
    "courtCount": 2,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1231,
    "siteArea": 715,
    "builtYear": 2021,
    "owner": "강서구",
    "manager": "강서구",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "황금내 테니스장",
    "normalizedName": "황금내",
    "district": "강서구",
    "address": null,
    "courtCount": 1,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 765,
    "siteArea": 765,
    "builtYear": 2020,
    "owner": "강서구",
    "manager": "강서구",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "서남물재생센터테니스장",
    "normalizedName": "서남물재생센터",
    "district": "강서구",
    "address": "마곡동 91",
    "courtCount": 14,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": 10
      },
      {
        "type": "케미칼",
        "count": 4
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디 10면, 케미칼 4면",
    "area": 12700,
    "siteArea": 12700,
    "builtYear": 2010,
    "owner": "서울시",
    "manager": "서울물재생시설공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "고척근린공원 테니스장",
    "normalizedName": "고척근린공원",
    "district": "구로구",
    "address": "고척2동산9-14",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1558,
    "siteArea": 1764,
    "builtYear": 1989,
    "owner": "서울시",
    "manager": "구로구",
    "contact": "860-3361",
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": "2003년도"
  },
  {
    "facilityName": "계남근린공원 테니스장",
    "normalizedName": "계남근린공원",
    "district": "구로구",
    "address": "구로구 중앙로17길 10",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 2347,
    "siteArea": 2609,
    "builtYear": 2000,
    "owner": "서울시",
    "manager": "구로구",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "신도림테니스장",
    "normalizedName": "신도림",
    "district": "구로구",
    "address": "신도림동 276-4",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "아크릴",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "아크릴",
    "area": 2000,
    "siteArea": 2000,
    "builtYear": 2016,
    "owner": "구로구",
    "manager": "구로구 시설관리공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "안양천 하드코트테니스장",
    "normalizedName": "안양천하드코트",
    "district": "영등포구",
    "address": null,
    "courtCount": 7,
    "surfaces": [
      {
        "type": "우레탄",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "우레탄",
    "area": 5100,
    "siteArea": 5100,
    "builtYear": 2021,
    "owner": "영등포구",
    "manager": "영등포구시설관리공단",
    "contact": "서울시한강시민공원사업소(3780-0777~8)",
    "website": "hangang.seoul.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "대림체육공원 테니스장",
    "normalizedName": "대림체육공원",
    "district": "영등포구",
    "address": "대림동780",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 792,
    "siteArea": 6000,
    "builtYear": 1996,
    "owner": "영등포구",
    "manager": "영등포구시설관리공단",
    "contact": "영등포구청 공원녹지과",
    "website": "ydp.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "독산 테니스장",
    "normalizedName": "독산",
    "district": "금천구",
    "address": null,
    "courtCount": 6,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 3875,
    "siteArea": 5080,
    "builtYear": 2010,
    "owner": "금천구",
    "manager": "금천구테니스연합회",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "보라매공원 테니스장",
    "normalizedName": "보라매공원",
    "district": "동작구",
    "address": "신대방동 395번지",
    "courtCount": 7,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 4861,
    "siteArea": 5810,
    "builtYear": 2007,
    "owner": "서울시",
    "manager": "개인",
    "contact": "개인",
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": {
      "count": 1,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "노량진공원 테니스장",
    "normalizedName": "노량진공원",
    "district": "동작구",
    "address": "대방동 23-189",
    "courtCount": 5,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 2830,
    "siteArea": 2836,
    "builtYear": 1993,
    "owner": "서울시",
    "manager": "개인",
    "contact": "개인(김용길 : 817-2070)",
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": {
      "count": 5,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "동작주차공원 테니스장",
    "normalizedName": "동작주차공원",
    "district": "동작구",
    "address": "동작동 326",
    "courtCount": 6,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 3100,
    "siteArea": 3600,
    "builtYear": 1979,
    "owner": "동작구",
    "manager": "동작구",
    "contact": "동작구 (820-9842)",
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": {
      "count": 5,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "관악구민운동장 테니스장",
    "normalizedName": "관악구민운동장",
    "district": "관악구",
    "address": "봉천7동 산53번지",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 2354,
    "siteArea": 2354,
    "builtYear": 1992,
    "owner": "관악구",
    "manager": "관악구시설관리공단",
    "contact": "관악구(880-3137)",
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "난우공원테니스장",
    "normalizedName": "난우공원",
    "district": "관악구",
    "address": "신림동 598-60",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1250,
    "siteArea": 1177,
    "builtYear": 2008,
    "owner": "관악구",
    "manager": "한국대학테니스연맹",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "선우공원테니스장",
    "normalizedName": "선우공원",
    "district": "관악구",
    "address": null,
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1866,
    "siteArea": 1866,
    "builtYear": 2008,
    "owner": "관악구",
    "manager": "관악구테니스협회",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "한강공원 잠원지구테니스장",
    "normalizedName": "한강공원잠원지구",
    "district": "서초구",
    "address": null,
    "courtCount": 6,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1304,
    "siteArea": 1304,
    "builtYear": 2009,
    "owner": "서울시",
    "manager": "미래한강본부",
    "contact": "서울시한강시민공원사업소(3780-0777~8)",
    "website": "hangang.seoul.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "시민의숲테니스장",
    "normalizedName": "시민의숲",
    "district": "서초구",
    "address": "서초구 양재동 224번지외3필지",
    "courtCount": 11,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 7863,
    "siteArea": 7863,
    "builtYear": 1991,
    "owner": "서울시",
    "manager": "미래생활체육연합회",
    "contact": "개인",
    "website": null,
    "indoorOutdoor": null,
    "lighting": {
      "count": 1,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "반포종합운동장 테니스장",
    "normalizedName": "반포종합운동장",
    "district": "서초구",
    "address": "신반포로16길 30",
    "courtCount": 12,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 7308,
    "siteArea": 56000,
    "builtYear": 2005,
    "owner": "서초구",
    "manager": "서초구테니스협회",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "내곡동체육시설  테니스장",
    "normalizedName": "내곡동체육시설",
    "district": "서초구",
    "address": "신흥말길 23-5",
    "courtCount": 6,
    "surfaces": [
      {
        "type": "하드코트",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "하드코트",
    "area": 3419,
    "siteArea": 8730,
    "builtYear": 2012,
    "owner": "서초구",
    "manager": "미래생활체육연합회",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "봉은 테니스장",
    "normalizedName": "봉은",
    "district": "강남구",
    "address": "삼성동 75번지",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 2500,
    "siteArea": 3251,
    "builtYear": 1994,
    "owner": "강남구",
    "manager": "강남도시관리공단",
    "contact": "542-7252",
    "website": "http://www.kncity.or.kr",
    "indoorOutdoor": "outdoor",
    "lighting": {
      "count": 2,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "포이 테니스장",
    "normalizedName": "포이",
    "district": "강남구",
    "address": "포이동 274번지",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1500,
    "siteArea": 1670,
    "builtYear": 1990,
    "owner": "강남구",
    "manager": "강남도시관리공단",
    "contact": "3461-9928",
    "website": "http://www.kncity.or.kr",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "강남세곡체육공원 테니스장",
    "normalizedName": "강남세곡체육공원",
    "district": "강남구",
    "address": "포이동 274번지",
    "courtCount": 4,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 1670,
    "siteArea": 2440,
    "builtYear": 2023,
    "owner": "강남구",
    "manager": "강남도시관리공단",
    "contact": "3461-9928",
    "website": "http://www.kncity.or.kr",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "대치 유수지체육공원 테니스장",
    "normalizedName": "대치유수지체육공원",
    "district": "강남구",
    "address": "대치동78-20",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "탄성복합고무",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "탄성복합고무",
    "area": 0,
    "siteArea": 1400,
    "builtYear": 2008,
    "owner": "서울시",
    "manager": "강남구",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "마루공원 테니스장",
    "normalizedName": "마루공원",
    "district": "강남구",
    "address": "개포로 625",
    "courtCount": 3,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 792,
    "siteArea": 2367,
    "builtYear": 2010,
    "owner": "서울시",
    "manager": "서울물재생시설공단",
    "contact": "서울시",
    "website": "www.ijongno.co.kr",
    "indoorOutdoor": null,
    "lighting": {
      "count": 9,
      "lux": 500
    },
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "탄천물재생센터 테니스장",
    "normalizedName": "탄천물재생센터",
    "district": "강남구",
    "address": "개포로 625",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 528,
    "siteArea": 1232,
    "builtYear": 2006,
    "owner": "서울시",
    "manager": "서울물재생시설공단",
    "contact": "서울시",
    "website": "www.ijongno.co.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": "1974"
  },
  {
    "facilityName": "올림픽 테니스경기장",
    "normalizedName": "올림픽",
    "district": "송파구",
    "address": null,
    "courtCount": 13,
    "surfaces": [
      {
        "type": "케미칼",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "케미칼",
    "area": 15453,
    "siteArea": 9064,
    "builtYear": 1986,
    "owner": "국민체육 진흥공단",
    "manager": "한국체육산업개발",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": 9931,
    "renovation": null
  },
  {
    "facilityName": "올림픽 실내테니스장",
    "normalizedName": "올림픽실내",
    "district": "송파구",
    "address": null,
    "courtCount": 4,
    "surfaces": [
      {
        "type": "케미칼",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "케미칼",
    "area": 4987,
    "siteArea": 4994,
    "builtYear": 2002,
    "owner": "국민체육 진흥공단",
    "manager": "한국체육산업개발",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "오금공원 테니스장",
    "normalizedName": "오금공원",
    "district": "송파구",
    "address": "오금동 51",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1299,
    "siteArea": 1299,
    "builtYear": 1990,
    "owner": "송파구",
    "manager": "송파구",
    "contact": "공원녹지과(410-3395)",
    "website": "www.songpa.seoul.kr",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "오륜 테니스장",
    "normalizedName": "오륜",
    "district": "송파구",
    "address": "방이동 439-8",
    "courtCount": 6,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 3228,
    "siteArea": 7038,
    "builtYear": 1991,
    "owner": "송파구",
    "manager": "생활체육연합회",
    "contact": "문화체육과(410-3410)",
    "website": "www.songpa.seoul.kr",
    "indoorOutdoor": "outdoor",
    "lighting": {
      "count": 4,
      "lux": null
    },
    "spectatorSeats": null,
    "renovation": "93. 6.11, 94. 7.13"
  },
  {
    "facilityName": "송파 테니스장",
    "normalizedName": "송파",
    "district": "송파구",
    "address": "송파1동 106",
    "courtCount": 2,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1378,
    "siteArea": 1472,
    "builtYear": 1989,
    "owner": "송파구",
    "manager": "테니스연합회",
    "contact": "문화체육과(410-3410)",
    "website": "www.songpa.seoul.kr",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "성내 천변테니스장",
    "normalizedName": "성내천변",
    "district": "송파구",
    "address": null,
    "courtCount": 3,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 1680,
    "siteArea": 1680,
    "builtYear": 2004,
    "owner": "송파구",
    "manager": "테니스연합회",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "강일 테니스장",
    "normalizedName": "강일",
    "district": "강동구",
    "address": null,
    "courtCount": 10,
    "surfaces": [
      {
        "type": "우레탄",
        "count": null
      }
    ],
    "surfaceCategory": "hard",
    "surfaceDisplay": "우레탄",
    "area": 5561,
    "siteArea": 18060,
    "builtYear": 2011,
    "owner": "강동구",
    "manager": "강동구 도시관리공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "명일테니스장",
    "normalizedName": "명일",
    "district": "강동구",
    "address": null,
    "courtCount": 5,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 2832,
    "siteArea": 6709,
    "builtYear": 2019,
    "owner": "강동구",
    "manager": "강동구 도시관리공단",
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "한강시민공원 광나루지구 테니스장",
    "normalizedName": "한강시민공원광나루지구",
    "district": "강동구",
    "address": null,
    "courtCount": 8,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 5583,
    "siteArea": 5583,
    "builtYear": 1993,
    "owner": "서울시",
    "manager": "미래한강본부",
    "contact": "서울시한강시민공원사업소(3780-0777~8)",
    "website": "hangang.seoul.go.kr",
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "인재개발원 테니스장",
    "normalizedName": "인재개발원",
    "district": "서초구",
    "address": null,
    "courtCount": 2,
    "surfaces": [
      {
        "type": "인조잔디",
        "count": null
      }
    ],
    "surfaceCategory": "artificial_grass",
    "surfaceDisplay": "인조잔디",
    "area": 0,
    "siteArea": 0,
    "builtYear": null,
    "owner": null,
    "manager": null,
    "contact": null,
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "잠실유수지 테니스장",
    "normalizedName": "잠실유수지체육시설",
    "district": "송파구",
    "address": null,
    "courtCount": 3,
    "surfaces": [],
    "surfaceCategory": "unknown",
    "surfaceDisplay": "",
    "area": 0,
    "siteArea": 0,
    "builtYear": null,
    "owner": null,
    "manager": null,
    "contact": null,
    "website": null,
    "indoorOutdoor": null,
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "동부도로사업소 테니스장",
    "normalizedName": "동부도로사업소",
    "district": "강남구",
    "address": null,
    "courtCount": 1,
    "surfaces": [],
    "surfaceCategory": "unknown",
    "surfaceDisplay": "",
    "area": 0,
    "siteArea": 0,
    "builtYear": null,
    "owner": "서울시",
    "manager": "동부도로사업소",
    "contact": null,
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "남부도로사업소 테니스장",
    "normalizedName": "남부도로사업소",
    "district": "영등포구",
    "address": null,
    "courtCount": 1,
    "surfaces": [],
    "surfaceCategory": "unknown",
    "surfaceDisplay": "",
    "area": 0,
    "siteArea": 0,
    "builtYear": null,
    "owner": "서울시",
    "manager": "남부도로사업소",
    "contact": null,
    "website": null,
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  },
  {
    "facilityName": "난지 한강공원 테니스장",
    "normalizedName": "난지한강",
    "district": "마포구",
    "address": null,
    "courtCount": 6,
    "surfaces": [
      {
        "type": "클레이",
        "count": null
      }
    ],
    "surfaceCategory": "clay",
    "surfaceDisplay": "클레이",
    "area": 0,
    "siteArea": 0,
    "builtYear": null,
    "owner": "서울시",
    "manager": "미래한강본부",
    "contact": null,
    "website": "hangang.seoul.go.kr",
    "indoorOutdoor": "outdoor",
    "lighting": null,
    "spectatorSeats": null,
    "renovation": null
  }
];

export default FACILITY_DATA;
