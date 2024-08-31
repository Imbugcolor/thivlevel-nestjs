import { CreateProductDto } from './dto/create-product.dto';

// áo POLO: 66d29893609df965cabf56ba
// áo Sơ Mi: 66d298b8609df965cabf56bf
// Áo Nỉ: 66d298d1609df965cabf56c4
// Quần Jogger: 66d298f8609df965cabf56cc
// Quần kaki: 66d2990e609df965cabf56d1
// Quần short: 66d29926609df965cabf56d6
// Quần Jean: 64bf930bed0c1837dd8ee977
// Quần tây: 64be3be9cc8b8b1cd208fd37
// Áo Thun: 64be3de46ed10e38f33113cc
export const productsJson: CreateProductDto[] = [
  {
    product_sku: 'SP01AT',
    title: 'áo thun wash sp01at',
    description: 'Đây là mô tả mặc định',
    price: 25,
    content: 'Đây là nội dung mặc định',
    category: '64be3de46ed10e38f33113cc',
    images: [
      {
        public_id: 'products/fk8qytn6u5natrqcsotw',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682152527/products/fk8qytn6u5natrqcsotw.jpg',
      },
      {
        public_id: 'products/jff2ryhhg0xpwitits7h',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682152537/products/jff2ryhhg0xpwitits7h.jpg',
      },
    ],
    variants: [
      {
        size: 'S',
        color: 'Đen',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Đen',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Đen',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Đen',
        inventory: 34,
      },
    ],
  },
  {
    product_sku: 'SP03PL',
    title: 'áo polo white round beige sp03pl',
    description: 'Áo Polo White Round Beige Phong Cách Basic',
    price: 35,
    content: `  - Chất Liệu: Cá Xấu 4 Chiều
                - Định Lượng: 300GSM
                - Form Áo: Slim Fit
                - Độ Co Giãn: Trung Bình
                - Tay Áo: Tay Ngắn
                - Loại Áo: Áo Trơn
                - Phong Cách: Basic, Casual`,
    category: '66d29893609df965cabf56ba',
    images: [
      {
        public_id: 'products/vnvwcbptudfsxlvvjp8n',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682410627/products/vnvwcbptudfsxlvvjp8n.png',
      },
      {
        public_id: 'products/d7dfl8n3v71lx86b6hte',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411030/products/d7dfl8n3v71lx86b6hte.png',
      },
    ],
    variants: [
      {
        size: 'S',
        color: 'Xám',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Xám',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Xám',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Xám',
        inventory: 34,
      },
    ],
  },
  {
    product_sku: 'SP04PL',
    title: 'áo polo v neck dots fabric sp04pl',
    description: 'Áo Polo V Neck Dots Fabric SP04PL  Phong Cách Basic',
    price: 32,
    content: `  - Chất Liệu: Cá Sấu Mắt Nai
                - Định Lượng: 250GSM
                - Form Áo: Slim Fit
                - Độ Co Giãn: Ít
                - Tay Áo: Tay Ngắn
                - Loại Áo: Áo Trơn
                - Phong Cách: Basic`,
    category: '66d29893609df965cabf56ba',
    images: [
      {
        public_id: 'products/x9mncce8nghljdhtacuy',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411259/products/x9mncce8nghljdhtacuy.png',
      },
      {
        public_id: 'products/ei5wtbeot40dvzibzkdm',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411278/products/ei5wtbeot40dvzibzkdm.png',
      },
      {
        public_id: 'products/qjrze1uu82deqaqcnim4',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411290/products/qjrze1uu82deqaqcnim4.png',
      },
    ],
    variants: [
      {
        size: 'S',
        color: 'Xám',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Xám',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Xám',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Xám',
        inventory: 34,
      },
      {
        size: 'XXL',
        color: 'Xám',
        inventory: 34,
      },
      {
        size: 'S',
        color: 'Trắng',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Trắng',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Trắng',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Trắng',
        inventory: 34,
      },
      {
        size: 'XXL',
        color: 'Trắng',
        inventory: 34,
      },
      {
        size: 'S',
        color: 'Đen',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Đen',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Đen',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Đen',
        inventory: 34,
      },
      {
        size: 'XXL',
        color: 'Đen',
        inventory: 34,
      },
    ],
  },
  {
    product_sku: 'SP05AT',
    title: 'áo thun minidots innovative sp05at',
    description:
      'Áo Thun Minidots Innovative SP05AT Chất Liệu Pique CVC 2 Chiều',
    price: 22,
    content: `  - Chất Liệu: Pique CVC 2 Chiều
                - Form Áo: Slim Fit
                - Độ Co Giãn: Trung Bình
                - Tay Áo: Tay Ngắn
                - Cổ Áo: Cổ Tròn
                - Loại Áo: Áo Trơn
                - Phong Cách: Basic,Casual
                - Định Lượng: 260GSM`,
    category: '64be3de46ed10e38f33113cc',
    images: [
      {
        public_id: 'products/zhrvnzha8qrbh8hdm3rk',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411411/products/zhrvnzha8qrbh8hdm3rk.png',
      },
      {
        public_id: 'products/qxrielejsjsfsspi6y6l',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411422/products/qxrielejsjsfsspi6y6l.png',
      },
      {
        public_id: 'products/cqke0svokzsi5k1araam',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411440/products/cqke0svokzsi5k1araam.png',
      },
      {
        public_id: 'products/jgwj70wg1de15dyci8ff',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411459/products/jgwj70wg1de15dyci8ff.png',
      },
    ],
    variants: [
      {
        size: 'S',
        color: 'Xám',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Xám',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Xám',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Xám',
        inventory: 34,
      },
      {
        size: 'S',
        color: 'Trắng',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Trắng',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Trắng',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Trắng',
        inventory: 34,
      },
      {
        size: 'S',
        color: 'Đen',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Đen',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Đen',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Đen',
        inventory: 34,
      },
      {
        size: 'S',
        color: 'Nâu',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Nâu',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Nâu',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Nâu',
        inventory: 34,
      },
    ],
  },
  {
    product_sku: 'SP06AT',
    title: 'áo thun silver original black sp06at',
    description: 'Áo Thun Silver Original Black SP06AT Phong Cách Basic',
    price: 28,
    content: `  - Chất Liệu: Cotton 2 chiều
                - Form Áo: Regular
                - Độ Co Giãn: Trung Bình
                - Tay Áo: Tay Ngắn
                - Cổ Áo: Cổ Tròn
                - Loại Áo: In Hình
                - Phong Cách: Basic
                - Định Lượng: 250GSM`,
    category: '64be3de46ed10e38f33113cc',
    images: [
      {
        public_id: 'products/npmur16cj9bqlebks7bv',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411808/products/npmur16cj9bqlebks7bv.png',
      },
      {
        public_id: 'products/shk0mcgb43vu3pdx05i0',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411816/products/shk0mcgb43vu3pdx05i0.png',
      },
      {
        public_id: 'products/ftbbt2jtnahntbjjr2jm',
        url: 'https://res.cloudinary.com/dxq2f8e2a/image/upload/v1682411826/products/ftbbt2jtnahntbjjr2jm.png',
      },
    ],
    variants: [
      {
        size: 'S',
        color: 'Đen',
        inventory: 30,
      },
      {
        size: 'M',
        color: 'Đen',
        inventory: 35,
      },
      {
        size: 'L',
        color: 'Đen',
        inventory: 32,
      },
      {
        size: 'XL',
        color: 'Đen',
        inventory: 34,
      },
    ],
  },
];
