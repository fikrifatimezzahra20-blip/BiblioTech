import express from 'express';
import { Pool } from 'pg';

const app = express()
app.use(express.json())
const main = async () => {
    try{
        const pool =new Pool ({
            password: "1234",
            user: "user",
            database: "bibliotech",
            host: "localhost",
            port: 5432
        })
        const db = await pool.connect()
        console.log("Db is connected")

        const createTablebooks = `CREATE TABLE IF NOT EXISTS livres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        categorie VARCHAR(100) NOT NULL,
        annee_publication INT NOT NULL,
        disponible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;

        await db.query(createTablebooks)

        app.post("/livres", async (req, res) => {
            try {
                const { name, author, disponible } = req.body;
                const insertQuery = `INSERT INTO livres (name, author, disponible)
                                         VALUES ($1,$2,$3);`;
                await db.query(insertQuery, [name, author, disponible])
                res.status(201).json ({ 
                    message: "The Book has been created)"})
            } catch (_err) {
                console.log(_err)
                res.status(403).json({ error: "Error Occured please provide all information needed" })

            } 
        })

        app.listen(5020, () => console.log("This app is listening on port 5020"))
        } catch (error) {
            console.log("Oops! something went wrong")
        }
    }

    main()

            
