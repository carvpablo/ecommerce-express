import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Teclado Mecânico RGB",
    price: 29990, // R$ 299,90
    description:
      "Teclado mecânico com switches azuis, iluminação RGB e layout ABNT2.",
    stock: 25,
  },
  {
    name: "Mouse Gamer 16000 DPI",
    price: 15990, // R$ 159,90
    description:
      "Mouse ergonômico com sensor óptico de alta precisão e 6 botões programáveis.",
    stock: 40,
  },
  {
    name: "Headset 7.1 Surround",
    price: 24900, // R$ 249,00
    description:
      "Headset com isolamento acústico, microfone com cancelamento de ruído e drivers de 50mm.",
    stock: 15,
  },
  {
    name: 'Monitor Gamer 144Hz 24"',
    price: 89900, // R$ 899,00
    description:
      "Monitor IPS Full HD com taxa de atualização de 144Hz e tempo de resposta de 1ms.",
    stock: 10,
  },
  {
    name: "Mousepad Extra Grande (90x40cm)",
    price: 7990, // R$ 79,90
    description:
      "Superfície speed com base emborrachada antiderrapante e bordas costuradas.",
    stock: 50,
  },
  {
    name: "Cadeira Ergonômica Mesh",
    price: 74900, // R$ 749,00
    description:
      "Cadeira com ajuste de altura, apoio lombar e encosto em tela mesh respirável.",
    stock: 8,
  },
  {
    name: "Webcam Full HD 1080p",
    price: 18990, // R$ 189,90
    description:
      "Webcam com foco automático, microfone estéreo integrado e tampa de privacidade.",
    stock: 30,
  },
  {
    name: "Suporte Articulado para Monitor",
    price: 13990, // R$ 139,90
    description:
      "Braço articulado com pistão a gás para telas de 17 a 32 polegadas com padrão VESA.",
    stock: 20,
  },
];

async function main() {
  console.log("Iniciando seed de produtos...");

  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: product,
    });
    console.log(
      `✓ Produto criado: ${createdProduct.name} - R$ ${(createdProduct.price / 100).toFixed(2)}`,
    );
  }

  console.log("\nSeed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
