const db = require('./database');
db.serialize(() => {
    db.run("ALTER TABLE couriers ADD COLUMN photo_url TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Coluna photo_url já existe.');
            } else {
                console.error('Erro ao adicionar coluna:', err.message);
            }
        } else {
            console.log('Coluna photo_url adicionada com sucesso!');
        }
        process.exit();
    });
});
