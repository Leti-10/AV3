import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = "aerocode_secret_key_av3";

app.use(express.json());
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  res.on('finish', () => {
    const end = performance.now();
    const tempoProcessamento = (end - start).toFixed(2);
    console.log(`[Endpoint] ${req.method} ${req.path} | Processamento: ${tempoProcessamento}ms`);
  });
  next();
});

app.post("/login", async (req, res): Promise<any> => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { funcionario: true }, 
        });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                funcionarioId: user.funcionarioId,
                cargo: user.funcionario?.cargo
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );
        return res.json({
            token,
            user: { 
                id: user.id, 
                email: user.email, 
                funcionario: user.funcionario 
            },
            login: true,
        });
    } catch (error) {
        return res.status(500).json({ error: "Erro interno no login." });
    }
});

app.get('/aeronavesList', async (req, res) => {
    const aeronaves = await prisma.aeronave.findMany({
        include: { pecas: true, etapas: true, testes: true }
    });
    res.json(aeronaves);
});

app.get('/aeronaves/:codigo', async (req, res): Promise<any> => {
    const { codigo } = req.params;
    
    const aeronave = await prisma.aeronave.findUnique({
        where: { codigo },
        include: { 
            pecas: true, 
            etapas: { include: { funcionarios: { include: { funcionario: true } } } }, 
            testes: true 
        }
    });

    if (!aeronave) return res.status(404).json({ error: "Aeronave não encontrada" });
    res.json(aeronave);
});

app.post('/aeronave', async (req, res) => {
    try {
        const { codigo, modelo, tipo, capacidade, alcance } = req.body;
        const nova = await prisma.aeronave.create({
            data: { 
                codigo: codigo, 
                modelo, 
                tipo, 
                capacidade: Number(capacidade), 
                alcance: Number(alcance) 
            }
        });
        res.status(201).json(nova);
    } catch (e) {
        res.status(400).json({ error: "Erro ao criar aeronave (Código duplicado?)" });
    }
});

app.get('/pecasList', async (req, res) => {
    const pecas = await prisma.peca.findMany({ include: { aeronave: true } });
    res.json(pecas);
});

app.post('/peca', async (req, res) => {
    try {
        const { nome, tipo, fornecedor, status, aeronaveId } = req.body;
        const novaPeca = await prisma.peca.create({
            data: { 
                nome, 
                tipo, 
                fornecedor, 
                status, 
                aeronaveId: aeronaveId 
            }
        });
        res.status(201).json(novaPeca);
    } catch (e) {
        console.log(e);
        res.status(400).json({ error: "Erro ao criar peça" });
    }
});

app.put('/pecaEdit', async (req, res) => {
    try {
        const { id, status } = req.body;
        const atualizada = await prisma.peca.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json(atualizada);
    } catch (e) {
        res.status(400).json({ error: "Erro ao atualizar peça" });
    }
});

app.get('/etapas/:aeronaveId', async (req, res) => {
  const { aeronaveId } = req.params;

  try {
    const etapas = await prisma.etapa.findMany({
      where: { aeronaveId }, 
      include: { funcionarios: { include: { funcionario: true } } },
      orderBy: { dataPrevista: 'asc' },
    });
    res.json(etapas);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao buscar etapas" });
  }
});

app.post('/etapa', async (req, res): Promise<any> => {
    try {
        const { nome, dataPrevista, status, aeronaveId, funcionarioIds } = req.body;
        if (!nome || !dataPrevista || !aeronaveId) {
            return res.status(400).json({ error: "Campos obrigatórios faltando." });
        }
        let funcionariosConnect = {};
        if (funcionarioIds && Array.isArray(funcionarioIds) && funcionarioIds.length > 0) {
            funcionariosConnect = {
                create: funcionarioIds.map((id: any) => ({
                    funcionario: { connect: { id: Number(id) } }
                }))
            };
        }

        const nova = await prisma.etapa.create({
            data: {
                nome,
                dataPrevista: new Date(dataPrevista),
                status,
                aeronaveId: aeronaveId, 
                funcionarios: funcionariosConnect
            }
        });
        res.status(201).json(nova);
    } catch (e: any) {
        console.error("Erro ao criar etapa:", e);
        res.status(400).json({ error: "Erro ao criar etapa.", details: e.message });
    }
});

app.put('/etapaEdit', async (req, res) => {
    try {
        const { id, status } = req.body;
        const atualizada = await prisma.etapa.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json(atualizada);
    } catch (e) {
        res.status(400).json({ error: "Erro ao atualizar etapa" });
    }
});

app.get('/etapas', async (req, res) => {
  try {
    const etapas = await prisma.etapa.findMany({
      include: { funcionarios: { include: { funcionario: true } } },
      orderBy: { dataPrevista: 'asc' },
    });
    res.json(etapas);
  } catch (e) {
    res.status(500).json({ error: "Erro ao buscar todas as etapas" });
  }
});

app.get('/testes/:aeronaveId', async (req, res) => {
    const { aeronaveId } = req.params;
    const testes = await prisma.teste.findMany({
        where: { aeronaveId },
        orderBy: { data: 'desc' }
    });
    res.json(testes);
});

app.post('/teste', async (req, res) => {
    try {
        const { aeronaveId, tipo, resultado } = req.body;
        const novoTeste = await prisma.teste.create({
            data: { 
                aeronaveId: aeronaveId, 
                tipo, 
                resultado 
            }
        });
        res.status(201).json(novoTeste);
    } catch (e) {
        console.log(e);
        res.status(400).json({ error: "Erro ao registrar teste" });
    }
});

app.put('/testeEdit', async (req, res) => {
    try {
        const { id, resultado } = req.body;
        const atualizado = await prisma.teste.update({
            where: { id: Number(id) },
            data: { resultado }
        });
        res.json(atualizado);
    } catch (e) {
        res.status(400).json({ error: "Erro ao atualizar teste" });
    }
});

app.get('/testesList', async (req, res) => {
    try {
        const testes = await prisma.teste.findMany({
            include: { 
                aeronave: true 
            },
            orderBy: { data: 'desc' }
        });
        res.json(testes);
    } catch (e) {
        res.status(500).json({ error: "Erro ao buscar lista de testes" });
    }
});

app.get('/funcionariosList', async (req, res) => {
    const funcs = await prisma.funcionario.findMany({
        include: { endereco: true, telefone: true }
    });
    res.json(funcs);
});

app.post('/funcionario', async (req, res): Promise<any> => {
    try {
        const { nome, cpf, cargo, usuario, senha, endereco, telefone } = req.body;

        if (!nome || !cpf || !usuario || !senha) {
             return res.status(400).json({ error: "Campos obrigatórios faltando." });
        }
        const resultado = await prisma.$transaction(async (prisma:any) => {
            const novoFuncionario = await prisma.funcionario.create({
                data: {
                    nome,
                    cpf,
                    cargo, 
                    usuario,
                    senha,
                    endereco: endereco ? { create: endereco } : undefined,
                    telefone: telefone ? { create: telefone } : undefined,
                },
                include: { endereco: true, telefone: true }
            });
            await prisma.user.create({
                data: {
                    email: usuario,
                    password: senha,
                    funcionarioId: novoFuncionario.id
                }
            });

            return novoFuncionario;
        });
        res.status(201).json(resultado);
    } catch (e: any) {
        console.error(e);
        if (e.code === 'P2002') {
            const alvo = e.meta?.target;
            return res.status(400).json({ error: `Já existe um registro com este ${alvo} (CPF ou Usuário).` });
        }
        res.status(400).json({ error: "Erro ao criar funcionário" });
    }
});

app.put('/funcionarioEdit', async (req, res) => {
  try {
    const { id, nome, cpf, cargo, usuario, senha, endereco, telefone } = req.body;
    const dadosParaAtualizar: any = {
      nome,
      cpf,
      cargo,
      usuario,
      senha,
    };
    if (endereco) {
      dadosParaAtualizar.endereco = {
        upsert: {
          create: endereco,
          update: endereco,
        },
      };
    }
    if (telefone) {
      dadosParaAtualizar.telefone = {
        upsert: {
          create: telefone,
          update: telefone,
        },
      };
    }
    const funcionarioAtualizado = await prisma.funcionario.update({
      where: { id: Number(id) },
      data: dadosParaAtualizar,
      include: { endereco: true, telefone: true }
    });
    res.json(funcionarioAtualizado);
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: e.message || "Erro ao atualizar funcionário" });
  }
});

app.delete("/funcionario/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.$transaction([
            prisma.user.deleteMany({ where: { funcionarioId: id } }),
            prisma.telefone.deleteMany({ where: { funcionarioId: id } }),
            prisma.endereco.deleteMany({ where: { funcionarioId: id } }),
            prisma.funcionario.delete({ where: { id } })
        ]);
        res.json({ message: "Funcionário removido" });
    } catch (e) {
        console.log(e);
        res.status(400).json({ error: "Erro ao deletar funcionário" });
    }
});

app.get('/dashboard/stats', async (req, res) => {
    try {
        const totalAeronaves = await prisma.aeronave.count();
        const totalPecas = await prisma.peca.count();
        const totalRelatorios = await prisma.relatorio.count();

        const aeronavesPorTipo = await prisma.aeronave.groupBy({
            by: ['tipo'],
            _count: { tipo: true }
        });

        res.json({ 
            totalAeronaves,
            totalPecas,
            totalRelatorios,
            aeronavesPorTipo
        });
    } catch (e) {
        res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
});


app.post("/gerarRelatorio", async (req, res): Promise<any> => {
    const { aeronaveId, autor } = req.body;
    const codigo = aeronaveId;

    try {
        const aeronave = await prisma.aeronave.findUnique({
            where: { codigo },
            include: { pecas: true, etapas: true, testes: true }
        });

        if (!aeronave) {
            return res.status(404).json({ error: "Aeronave não encontrada" });
        }

        const etapasPendentes = aeronave.etapas.filter((e:any) => e.status !== 'Concluido');
        if (etapasPendentes.length > 0) {
            return res.status(403).json({ 
                error: `Relatório negado. Etapas pendentes: ${etapasPendentes.map((e:any) => e.nome).join(', ')}` 
            });
        }

        const pecasNaoProntas = aeronave.pecas.filter((p:any) => p.status !== 'Pronta_para_uso');
        if (pecasNaoProntas.length > 0) {
            return res.status(403).json({ 
                error: `Relatório negado. Peças não finalizadas: ${pecasNaoProntas.map((p:any) => p.nome).join(', ')}` 
            });
        }

        const testesReprovados = aeronave.testes.filter((t:any) => t.resultado === 'Reprovado');
        if (testesReprovados.length > 0) {
            return res.status(403).json({ 
                error: "Relatório negado. Existem testes REPROVADOS." 
            });
        }

        const temAprovado = aeronave.testes.some((t:any) => t.resultado === 'Aprovado');
        if (!temAprovado) {
            return res.status(403).json({ 
                error: "A aeronave precisa ter pelo menos um teste APROVADO." 
            });
        }
        const relatorioDB = await prisma.relatorio.create({
            data: {
                titulo: `Relatório de Entrega - Aeronave ${aeronave.modelo}`,
                autor: autor || "Sistema",
                aeronaveId: codigo
            }
        });
        return res.json({
            id: relatorioDB.id,
            titulo: relatorioDB.titulo,
            dataGeracao: relatorioDB.dataEmissao,
            autor: relatorioDB.autor,
            status: "APROVADO PARA ENTREGA",
            dados: aeronave
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erro ao gerar relatório" });
    }
});

app.get("/relatorios", async (req, res) => {
  try {
    const relatorios = await prisma.relatorio.findMany({
      orderBy: { dataEmissao: "desc" },
      include: {
        aeronave: {
          include: {
            pecas: true,
            etapas: true,
            testes: true
          }
        }
      }
    });

    const resposta = relatorios.map((r:any) => ({
      titulo: r.titulo,
      dataGeracao: r.dataEmissao,
      autor: r.autor,
      status: "APROVADO PARA ENTREGA",

      dados: {
        codigo: r.aeronave.codigo,
        modelo: r.aeronave.modelo,
        tipo: r.aeronave.tipo,
        capacidade: r.aeronave.capacidade,
        alcance: r.aeronave.alcance,
        pecas: r.aeronave.pecas,
        etapas: r.aeronave.etapas,
        testes: r.aeronave.testes,
      }
    }));

    res.json(resposta);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar relatórios" });
  }
});




app.listen(PORT, () => {
    console.log(`\nServidor rodando`);
    console.log(`Link: http://localhost:${PORT}`);
});