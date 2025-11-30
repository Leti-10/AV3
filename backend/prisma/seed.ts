import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando Seed...\n')

  const admin = await prisma.funcionario.upsert({
    where: { usuario: 'admin@admin.com' },
    update: {},
    create: {
      nome: 'Administrador Principal',
      cpf: '857.133.950-30',
      cargo: 'Administrador',
      usuario: 'admin@admin.com',
      senha: '123',
      endereco: {
        create: {
          rua: 'Rua Central',
          numero: 100,
          bairro: 'Centro',
          cidade: 'SJC'
        }
      },
      telefone: {
        create: {
          ddd: '12',
          numero: '999999999'
        }
      }
    }
  })

  const engenheiro = await prisma.funcionario.create({
    data: {
      nome: 'João Engenheiro',
      cpf: '321.654.987-01',
      cargo: 'Engenheiro',
      usuario: 'joao@empresa.com',
      senha: '123',
      endereco: {
        create: {
          rua: 'Rua Alfa',
          numero: 200,
          bairro: 'Jardim América',
          cidade: 'SJC'
        }
      }
    }
  })

  const operador = await prisma.funcionario.create({
    data: {
      nome: 'Marcos Operador',
      cpf: '987.321.654-11',
      cargo: 'Operador',
      usuario: 'marcos@empresa.com',
      senha: '123'
    }
  })

  const inspetor = await prisma.funcionario.create({
    data: {
      nome: 'Carlos Inspetor',
      cpf: '111.222.333-44',
      cargo: 'Operador',
      usuario: 'carlos@empresa.com',
      senha: '123'
    }
  })

  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: '123',
      funcionarioId: admin.id
    }
  })

  const aeronaves = [
    {
      codigo: "E195",
      modelo: "Embraer E195-E2",
      tipo: "Comercial",
      capacidade: 146,
      alcance: 4800
    },
    {
      codigo: "A320",
      modelo: "Airbus A320 Neo",
      tipo: "Comercial",
      capacidade: 180,
      alcance: 6100
    },
    {
      codigo: "F39",
      modelo: "Gripen F-39",
      tipo: "Militar",
      capacidade: 1,
      alcance: 3200
    }
  ]

  for (const a of aeronaves) {
    await prisma.aeronave.upsert({
      where: { codigo: a.codigo },
      update: {},
      create: {
        ...a,
        pecas: {
          create: [
            {
              nome: 'Turbina',
              tipo: 'Importada',
              fornecedor: 'GE',
              status: 'Em_producao'
            },
            {
              nome: 'Asa Direita',
              tipo: 'Nacional',
              fornecedor: 'Embraer',
              status: 'Pronta_para_uso'
            },
            {
              nome: 'Painel de Controle',
              tipo: 'Importada',
              fornecedor: 'Honeywell',
              status: 'Em_transporte'
            }
          ]
        },
        etapas: {
          create: [
            {
              nome: 'Montagem Estrutural',
              dataPrevista: new Date('2025-02-15'),
              status: 'Pendente',
              funcionarios: {
                create: [{ funcionarioId: engenheiro.id }]
              }
            },
            {
              nome: 'Instalação de Sistemas',
              dataPrevista: new Date('2025-03-10'),
              status: 'Em_andamento',
              funcionarios: {
                create: [
                  { funcionarioId: operador.id },
                  { funcionarioId: inspetor.id }
                ]
              }
            },
            {
              nome: 'Inspeção Final',
              dataPrevista: new Date('2025-04-01'),
              status: 'Pendente',
              funcionarios: {
                create: [{ funcionarioId: inspetor.id }]
              }
            }
          ]
        },
        testes: {
          create: [
            {
              tipo: 'Eletrico',
              resultado: 'Aprovado'
            },
            {
              tipo: 'Hidraulico',
              resultado: 'Aprovado'
            }
          ]
        }
      }
    })
  }
  console.log('Banco populado com dados iniciais.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
