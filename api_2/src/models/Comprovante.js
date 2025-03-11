const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comprovante = sequelize.define('Comprovante', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    data: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    banco: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('valido', 'invalido'),
        allowNull: false
    }
}, {
    tableName: 'comprovantes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        // Criando um índice único composto para evitar duplicatas
        {
            unique: true,
            fields: ['nome', 'valor', 'data', 'banco'],
            name: 'comprovante_unique_index'
        }
    ]
});

module.exports = Comprovante;