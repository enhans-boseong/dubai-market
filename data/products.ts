/**
 * Enhans 마켓플레이스 - 두바이 쫀득 쿠키 상품 데이터
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
}

export const products: Product[] = [
  {
    id: 'dubai-cookie-original',
    name: '두바이 쫀득 쿠키 오리지널',
    description: '피스타치오 크림과 카다이프가 어우러진 오리지널 두바이 쿠키. 겉은 바삭, 속은 쫀득한 식감이 특징입니다.',
    price: 8900,
    originalPrice: 12000,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
    category: '쿠키',
    rating: 4.8,
    reviewCount: 1247,
    stock: 50,
    tags: ['베스트셀러', '피스타치오', '선물추천'],
  },
  {
    id: 'dubai-cookie-chocolate',
    name: '두바이 쫀득 쿠키 초콜릿',
    description: '진한 벨기에 초콜릿과 카다이프의 만남. 달콤 쌉싸름한 맛이 일품입니다.',
    price: 9500,
    originalPrice: 13000,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    category: '쿠키',
    rating: 4.7,
    reviewCount: 892,
    stock: 35,
    tags: ['초콜릿', '인기상품'],
  },
  {
    id: 'dubai-cookie-lotus',
    name: '두바이 쫀득 쿠키 로투스',
    description: '로투스 비스코프 스프레드가 들어간 특별한 두바이 쿠키. 커피와 환상의 조합!',
    price: 9900,
    originalPrice: 14000,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400',
    category: '쿠키',
    rating: 4.9,
    reviewCount: 654,
    stock: 20,
    tags: ['신상품', '로투스', '커피페어링'],
  },
  {
    id: 'dubai-cookie-matcha',
    name: '두바이 쫀득 쿠키 말차',
    description: '교토산 말차 파우더를 사용한 프리미엄 쿠키. 은은한 녹차 향이 매력적입니다.',
    price: 10500,
    image: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400',
    category: '쿠키',
    rating: 4.6,
    reviewCount: 423,
    stock: 15,
    tags: ['말차', '프리미엄'],
  },
  {
    id: 'dubai-cookie-set',
    name: '두바이 쫀득 쿠키 4종 세트',
    description: '오리지널, 초콜릿, 로투스, 말차 4가지 맛을 한번에! 선물용으로 완벽한 구성입니다.',
    price: 35000,
    originalPrice: 42000,
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=400',
    category: '세트',
    rating: 4.9,
    reviewCount: 2156,
    stock: 100,
    tags: ['세트', '선물추천', '베스트셀러'],
  },
];

/**
 * 상품 ID로 상품 찾기
 */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * 카테고리별 상품 필터링
 */
export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

/**
 * 가격순 정렬
 */
export function sortProductsByPrice(ascending = true): Product[] {
  return [...products].sort((a, b) =>
    ascending ? a.price - b.price : b.price - a.price
  );
}

/**
 * 인기순 정렬 (리뷰 수 기준)
 */
export function sortProductsByPopularity(): Product[] {
  return [...products].sort((a, b) => b.reviewCount - a.reviewCount);
}
