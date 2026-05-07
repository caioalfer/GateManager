const express = require('express');
const cors = require('cors');
const db = require('./database');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Permite ler JSON pesado no corpo das requisições (por causa da foto em base64)

// Servir os arquivos frontend estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// ==========================================
// ROTAS DE USUÁRIOS (CRUD)
// ==========================================

// 1. Registro (Create)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Preencha usuário e senha.' });
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Usuário já existe.' });
                return res.status(500).json({ error: 'Erro ao criar perfil.' });
            }
            res.json({ success: true, username });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar senha.' });
    }
});

// 2. Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Preencha usuário e senha.' });

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro interno.' });
        if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

        res.json({ success: true, username: user.username });
    });
});

// 3. Listar Usuários (Read)
app.get('/api/users', (req, res) => {
    db.all(`SELECT id, username, created_at FROM users ORDER BY username ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar usuários.' });
        res.json(rows);
    });
});

// 4. Atualizar Senha (Update)
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Nova senha é obrigatória.' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id], function(err) {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar senha.' });
            res.json({ success: true });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar senha.' });
    }
});

// 5. Deletar Usuário (Delete)
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao deletar usuário.' });
        res.json({ success: true });
    });
});

// ==========================================
// ROTAS DA API
// ==========================================

// 1. Cadastrar Motoboy
app.post('/api/couriers', (req, res) => {
    const { name, cpf, license_plate, photo_url, company } = req.body;
    
    if (!name || !cpf) {
        return res.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
    }

    const query = `INSERT INTO couriers (name, cpf, license_plate, photo_url, company) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, cpf, license_plate, photo_url || null, company || null], function(err) {
        if (err) {
            // Verifica erro de unicidade (ex: CPF já cadastrado)
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'CPF já cadastrado.' });
            }
            return res.status(500).json({ error: 'Erro ao cadastrar motoboy.' });
        }
        res.status(201).json({ id: this.lastID, name, cpf, license_plate, photo_url });
    });
});

// 2. Buscar Motoboys por Nome (para autocomplete)
app.get('/api/couriers/search/name', (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    
    const searchQuery = `%${q}%`;
    db.all(`SELECT * FROM couriers WHERE name LIKE ? LIMIT 10`, [searchQuery], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao pesquisar motoboy.' });
        res.json(rows);
    });
});

// 2.1 Buscar Motoboy por CPF (para auto-preenchimento no registro)
app.get('/api/couriers/:cpf', (req, res) => {
    const { cpf } = req.params;
    
    db.get(`SELECT * FROM couriers WHERE cpf = ?`, [cpf], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar motoboy.' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Motoboy não encontrado.' });
        }
        res.json(row);
    });
});

// Listar todos os motoboys
app.get('/api/couriers', (req, res) => {
    db.all(`SELECT * FROM couriers ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar motoboys.' });
        res.json(rows);
    });
});

// Editar Motoboy
app.put('/api/couriers/:id', (req, res) => {
    const { id } = req.params;
    const { name, cpf, license_plate, company, photo_url } = req.body;
    
    console.log(`Atualizando entregador ${id}. Tamanho da foto: ${photo_url ? photo_url.length : 0} caracteres.`);
    
    const query = `UPDATE couriers SET name = ?, cpf = ?, license_plate = ?, company = ?, photo_url = ? WHERE id = ?`;
    db.run(query, [name, cpf, license_plate, company, photo_url, id], function(err) {
        if (err) {
            console.error('Erro ao atualizar no SQLite:', err);
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'CPF já cadastrado.' });
            return res.status(500).json({ error: 'Erro ao atualizar motoboy.' });
        }
        res.json({ success: true });
    });
});

// Deletar Motoboy
app.delete('/api/couriers/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM couriers WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao deletar motoboy.' });
        res.json({ success: true });
    });
});

// 3. Registrar Entrada (Movimentação)
app.post('/api/records', (req, res) => {
    const { courier_id, store_name, operation_type, operator_name, dock_number } = req.body;

    if (!courier_id || !store_name || !operation_type) {
        return res.status(400).json({ error: 'Faltam dados obrigatórios para o registro.' });
    }

    const query = `INSERT INTO records (courier_id, store_name, operation_type, operator_name, dock_number) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [courier_id, store_name, operation_type, operator_name || 'Desconhecido', dock_number || '-'], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar o registro de entrada.' });
        }
        res.status(201).json({ id: this.lastID, courier_id, store_name, operation_type });
    });
});

// 4. Obter Histórico de Registros
app.get('/api/records', (req, res) => {
    const { user } = req.query;
    let whereClause = '';
    let params = [];

    if (user && user !== 'Operador') {
        whereClause = 'WHERE records.operator_name = ?';
        params = [user];
    }

    const query = `
        SELECT 
            records.id, 
            couriers.name AS courier_name, 
            couriers.cpf, 
            records.store_name, 
            records.operation_type, 
            records.entry_time,
            records.operator_name,
            records.dock_number
        FROM records
        JOIN couriers ON records.courier_id = couriers.id
        ${whereClause}
        ORDER BY records.entry_time DESC
        LIMIT 100
    `;
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar registros.' });
        }
        res.json(rows);
    });
});
// ==========================================
// ROTAS DE LOJAS
// ==========================================

// Obter todas as lojas
app.get('/api/stores', (req, res) => {
    db.all(`SELECT * FROM stores ORDER BY name ASC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar lojas.' });
        }
        res.json(rows);
    });
});

// Cadastrar nova loja
app.post('/api/stores', (req, res) => {
    const { name, code, razao_social, location, docks } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da loja é obrigatório.' });

    const query = `INSERT INTO stores (name, code, razao_social, location, docks) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, code, razao_social, location, docks], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Loja já cadastrada.' });
            return res.status(500).json({ error: 'Erro ao cadastrar loja.' });
        }
        res.status(201).json({ id: this.lastID, name, code, razao_social, location, docks });
    });
});

// Editar loja
app.put('/api/stores/:id', (req, res) => {
    const { id } = req.params;
    const { name, code, razao_social, location, docks } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da loja é obrigatório.' });

    db.run(`UPDATE stores SET name = ?, code = ?, razao_social = ?, location = ?, docks = ? WHERE id = ?`, [name, code, razao_social, location, docks, id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Nome de loja já em uso.' });
            return res.status(500).json({ error: 'Erro ao atualizar loja.' });
        }
        res.json({ success: true });
    });
});

// Deletar loja
app.delete('/api/stores/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM stores WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao deletar loja.' });
        res.json({ success: true });
    });
});

// ==========================================
// ROTAS DE TRANSPORTADORAS (COMPANIES)
// ==========================================

// Listar todas
app.get('/api/companies', (req, res) => {
    db.all(`SELECT * FROM companies ORDER BY name ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar transportadoras.' });
        res.json(rows);
    });
});

// Cadastrar
app.post('/api/companies', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da transportadora é obrigatório.' });

    db.run(`INSERT INTO companies (name) VALUES (?)`, [name], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Transportadora já cadastrada.' });
            return res.status(500).json({ error: 'Erro ao cadastrar transportadora.' });
        }
        res.status(201).json({ id: this.lastID, name });
    });
});

// Editar
app.put('/api/companies/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório.' });

    db.run(`UPDATE companies SET name = ? WHERE id = ?`, [name, id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Nome já em uso.' });
            return res.status(500).json({ error: 'Erro ao atualizar.' });
        }
        res.json({ success: true });
    });
});

// Deletar
app.delete('/api/companies/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM companies WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao deletar.' });
        res.json({ success: true });
    });
});


// Função auxiliar para queries com Promisse (para o Dashboard)
const dbAllAsync = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// 5. Dados para Dashboard Básico Completo
app.get('/api/dashboard', async (req, res) => {
    const { user } = req.query;
    const isOperador = user === 'Operador';
    const userFilter = isOperador ? '' : 'AND operator_name = ?';
    const params = isOperador ? [] : [user];

    const getStats = async (dateFilter = '', filterParams = []) => {
        const typesQuery = `SELECT operation_type, COUNT(*) as count FROM records WHERE 1=1 ${dateFilter} ${userFilter} GROUP BY operation_type`;
        const storesQuery = `SELECT store_name, operation_type, COUNT(*) as count FROM records WHERE 1=1 ${dateFilter} ${userFilter} GROUP BY store_name, operation_type`;
        const peakHoursQuery = `SELECT strftime('%H', entry_time) as hour, COUNT(*) as count FROM records WHERE 1=1 ${dateFilter} ${userFilter} GROUP BY hour ORDER BY hour`;
        const operatorsQuery = `SELECT operator_name, COUNT(*) as count FROM records WHERE 1=1 ${dateFilter} ${userFilter} GROUP BY operator_name ORDER BY count DESC`;
        const historyQuery = `SELECT date(entry_time) as date, COUNT(*) as count FROM records WHERE 1=1 ${dateFilter} ${userFilter} GROUP BY date ORDER BY date ASC LIMIT 30`;

        const allParams = [...filterParams, ...params];
        const [types, stores, peak, operators, history] = await Promise.all([
            dbAllAsync(typesQuery, allParams),
            dbAllAsync(storesQuery, allParams),
            dbAllAsync(peakHoursQuery, allParams),
            dbAllAsync(operatorsQuery, allParams),
            dbAllAsync(historyQuery, allParams)
        ]);

        return { types, stores, peak, operators, history };
    };

    try {
        const [day, month, total] = await Promise.all([
            getStats("AND date(entry_time) = date('now', 'localtime')"),
            getStats("AND strftime('%m-%Y', entry_time) = strftime('%m-%Y', 'now', 'localtime')"),
            getStats("")
        ]);

        res.json({ day, month, total });
    } catch (error) {
        console.error("Erro no dashboard:", error);
        res.status(500).json({ error: 'Erro ao compilar dados do dashboard.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
