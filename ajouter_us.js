// seedUsers.js
// Script minimal pour insérer des utilisateurs avec mot de passe haché.
// Usage: node seedUsers.js

require('dotenv').config();           // Charge les variables d'environnement si nécessaire
const bcrypt = require('bcryptjs');   // bcryptjs évite des problèmes de compilation natifs
const pool = require('./config/db');  // Utilise ta connexion existante (adapter si nécessaire)

(async () => {
  try {
    // 1) Liste des utilisateurs à créer
    const users = [
      { username: 'admin',   password: '1234', role: 'admin' },
      { username: 'manager', password: 'abcd', role: 'manager' },
      { username: 'user',    password: '0000', role: 'user' },
      { username: 'ahmed',   password: '2006', role: 'admin' }
    ];

    // 2) On parcourt la liste et on traite chaque utilisateur
    for (const user of users) {
      // 2.1 Hachage du mot de passe (salt rounds = 10)
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // 2.2 On vérifie si le username existe déjà
      // Remarque: si pool.query retourne [rows, fields] (mysql2), on récupère rows via destructuring
      const [rows] = await pool.query('SELECT username FROM users WHERE username = ?', [user.username]);

      if (rows.length > 0) {
        console.log(`⚠️  L'utilisateur '${user.username}' existe déjà — insertion ignorée.`);
      } else {
        // 2.3 Insertion dans la table users
        await pool.query(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          [user.username, hashedPassword, user.role]
        );
        console.log(` Utilisateur '${user.username}' ajouté avec succès.`);
      }
    }

    // 3) Fermer la connexion si la méthode existe (pool.end est optionnelle selon ton implémentation)
    if (typeof pool.end === 'function') {
      await pool.end();
    }
    console.log(' Tous les utilisateurs ont été traités.');

  } catch (err) {
    console.error('Erreur lors de la création des utilisateurs :', err);
    // si tu veux un code d'erreur pour CI / scripts :
    process.exitCode = 1;
  }
})();

