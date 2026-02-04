const listings = [
  // =========================
  // VEÍCULOS (4)
  // =========================
  {
    id: 1,
    type: "vehicle",
    category: "carro",
    title: "BMW 320i M Sport",
    price: "R$ 289.900",
    location: "Curitiba, PR",
    createdAt: "2026-01-18",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
    ],
    details: { 
      year: "2023", 
      km: "12.000 km", 
      fuel: "Flex",
      transmission: "Automático",
      color: "Branco",
      bodyType: "Sedan",
      doors: "4"
    },
    tag: "Venda",
    contact: { whatsapp: "+55 (41) 99999-9999" },
  },
  {
    id: 2,
    type: "vehicle",
    category: "carro",
    title: "Porsche Macan T",
    price: "R$ 650.000",
    location: "São Paulo, SP",
    createdAt: "2026-01-16",
    images: [
      "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1400&q=80",
    ],
    details: { 
      year: "2022", 
      km: "8.500 km", 
      fuel: "Gasolina",
      transmission: "Automático",
      color: "Preto",
      bodyType: "SUV",
      doors: "5"
    },
    tag: "Venda",
    contact: { whatsapp: "+55 (11) 97777-1111" },
  },
  {
    id: 3,
    type: "vehicle",
    category: "carro",
    title: "Mercedes-Benz GLC 300 Coupé",
    price: "R$ 459.900",
    location: "Balneário Camboriú, SC",
    createdAt: "2026-01-14",
    images: [
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1611566026373-c6c6d2c5a8e1?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1f?auto=format&fit=crop&w=1400&q=80",
    ],
    details: { 
      year: "2021", 
      km: "22.400 km", 
      fuel: "Gasolina",
      transmission: "Automático",
      color: "Prata",
      bodyType: "Coupé",
      doors: "4"
    },
    tag: "Venda",
    contact: { whatsapp: "+55 (47) 98888-7777" },
  },
  {
    id: 4,
    type: "vehicle",
    category: "pickup",
    title: "Toyota Hilux GR-S",
    price: "R$ 340.000",
    location: "Goiânia, GO",
    createdAt: "2026-01-12",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=1400&q=80",
    ],
    details: { 
      year: "2024", 
      km: "0 km", 
      fuel: "Diesel",
      transmission: "Manual",
      color: "Cinza",
      bodyType: "Pickup",
      doors: "4"
    },
    tag: "Venda",
    contact: { whatsapp: "+55 (62) 99999-2222" },
  },

  // =========================
  // IMÓVEIS (4)
  // =========================
  {
    id: 5,
    type: "property",
    category: "apartamento",
    title: "Apartamento Alto Padrão Vista Mar",
    price: "R$ 1.250.000",
    location: "Balneário Camboriú, SC",
    createdAt: "2026-01-20",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
    ],
    details: { 
      beds: 3, 
      baths: 2, 
      area: "145m²",
      parkingSpaces: "2",
      acceptsPets: "yes",
      furnished: "no",
      floor: "alto"
    },
    tag: "Venda",
    contact: { whatsapp: "+55 (47) 98888-7777" },
  },
  {
    id: 6,
    type: "property",
    category: "casa",
    title: "Casa em Condomínio com Piscina",
    price: "R$ 15.000/mês",
    location: "Alphaville, SP",
    createdAt: "2026-01-10",
    images: [
      "https://images.unsplash.com/photo-1600596542815-2a4d04774c13?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b1b3b48c?auto=format&fit=crop&w=1400&q=80",
    ],
    details: { 
      beds: 4, 
      baths: 3, 
      area: "320m²",
      parkingSpaces: "4",
      acceptsPets: "negotiate",
      furnished: "semi",
      floor: "terreo"
    },
    tag: "Aluguel",
    contact: { whatsapp: "+55 (11) 96666-3333" },
  },
  {
    id: 7,
    type: "property",
    category: "apartamento",
    title: "Loft Moderno no Centro",
    price: "R$ 3.800/mês",
    location: "Florianópolis, SC",
    createdAt: "2026-01-09",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
    ],
    details: { 
      beds: 1, 
      baths: 1, 
      area: "55m²",
      parkingSpaces: "1",
      acceptsPets: "no",
      furnished: "yes",
      floor: "medio"
    },
    tag: "Aluguel",
    contact: { whatsapp: "+55 (48) 98888-4444" },
  },
  {
    id: 8,
    type: "property",
    category: "apartamento",
    title: "Cobertura Duplex com Terraço",
    price: "R$ 2.890.000",
    location: "Rio de Janeiro, RJ",
    createdAt: "2026-01-08",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
    ],
    details: { 
      beds: 4, 
      baths: 4, 
      area: "280m²",
      parkingSpaces: "3",
      acceptsPets: "yes",
      furnished: "no",
      floor: "cobertura"
    },
    tag: "Venda",
    contact: { whatsapp: "+55 (21) 97777-5555" },
  },
];

export default listings;
