const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dock_manager.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Inicialização das tabelas
db.serialize(() => {
    // Tabela de Motoboys
    db.run(`
        CREATE TABLE IF NOT EXISTS couriers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            license_plate TEXT,
            photo_url TEXT,
            company TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Tentativa de adicionar colunas para bancos antigos (ignora o erro silenciosamente se a coluna já existir)
    db.run("ALTER TABLE couriers ADD COLUMN company TEXT", (err) => { /* ignorar erro */ });
    db.run("ALTER TABLE couriers ADD COLUMN photo_url TEXT", (err) => { /* ignorar erro */ });

    // Tabela de Registros (Movimentações)
    db.run(`
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            courier_id INTEGER NOT NULL,
            store_name TEXT NOT NULL,
            operation_type TEXT NOT NULL CHECK(operation_type IN ('coleta', 'entrega', 'servico')),
            entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (courier_id) REFERENCES couriers(id)
        )
    `);

    // Tabela de Usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, () => {
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (!err && row && row.count === 0) {
                const bcrypt = require('bcryptjs');
                const defaultPass = bcrypt.hashSync('123456', 10);
                db.run("INSERT INTO users (username, password) VALUES ('Operador', ?)", [defaultPass], (err) => {
                    if (!err) console.log('Usuário padrão "Operador" criado com senha "123456".');
                });
            }
        });
    });

    // Adiciona colunas para controle do operador e doca
    db.run("ALTER TABLE records ADD COLUMN operator_name TEXT", (err) => { /* ignorar erro */ });
    db.run("ALTER TABLE records ADD COLUMN dock_number TEXT", (err) => { /* ignorar erro */ });

    // Tabela de Lojas
    db.run(`
        CREATE TABLE IF NOT EXISTS stores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            code TEXT,
            razao_social TEXT,
            location TEXT,
            docks TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Adiciona colunas se não existirem
    db.run("ALTER TABLE stores ADD COLUMN code TEXT", (err) => {});
    db.run("ALTER TABLE stores ADD COLUMN razao_social TEXT", (err) => {});
    db.run("ALTER TABLE stores ADD COLUMN location TEXT", (err) => {});
    db.run("ALTER TABLE stores ADD COLUMN docks TEXT", (err) => {});

    // Tabela de Transportadoras
    db.run(`
        CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;
