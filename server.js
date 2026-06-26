import express from 'express';
import { Pool } from 'pg';
// creating an instance of express
const app = express()



// middleware to parse incoming JSON requests
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
        titre VARCHAR(255) NOT NULL,
        auteur VARCHAR(255) NOT NULL,
        categorie VARCHAR(100) NOT NULL,
        annee_publication INT NOT NULL,
        disponible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await db.query(createTablebooks)

        app.post("/livres", async (req, res) => {
            try {
                const { titre, auteur, disponible, categorie, annee_publication } = req.body;

                const insertQuery = `INSERT INTO livres (titre, auteur, disponible, categorie, annee_publication)
                                         VALUES($1 ,$2 ,$3 ,$4 ,$5);`;
                await db.query(insertQuery, [titre, auteur, disponible, categorie, annee_publication])
                res.status(201).json ({ 
                    message: "The Book has been created"})
            } catch (err) {
                console.log(err)
                res.status(403).json({ error: "Error Occured please provide all information needed" })

            } 
        })

        app.get("/livres", async (req, res) => {
            try {
                const result = await db.query("SELECT * FROM livres")
                res.status(200).json(result.rows)
            } catch (err) {
                console.log(err)
                res.status(500).json({
                    message: "server error"
                });
            }
            });
            app.get("/livres/:id", async (req, res) => {
                try {
                    const { id } = req.params;
                    const result = await db.query(
                        "SELECT * FROM livres WHERE id = $1", 
                        [id]
                    );
                    if (result.rowCount === 0) {
                        return res.status(404).json({
                            message: "Book not found"
                        });
                    }
                    res.status(200).json(result.rows[0]);
                } catch (err) {
                    console.log(err)
                    res.status(500).json({
                        message: "server error"
                    });
                }
            });

            app.put("/livres/:id", async (req, res) => {
                try {
                    const { id } = req.params;
                    const { titre, auteur, disponible, categorie, annee_publication } = req.body;
                    const result= await db.query(
                        "UPDATE livres SET titre = $1, auteur = $2, disponible = $3, categorie = $4, annee_publication = $5 WHERE id = $6 RETURNING *",
                        [titre, auteur, disponible, categorie, annee_publication, id]
                    );
                    if (result.rowCount === 0) {
                        return res.status(404).json({
                            message: "Book not found"
                        });
                    }
                       res.status(200).json({
                            message:"Book updated successfully"
                        });
                } catch (err) {
                    console.log(err)
                    res.status(500).json({
                        message: "server error"
                    });
                }
            });

            app.delete("/livres/:id", async (req, res) => {
                try {
                    const { id } = req.params;
                    const result = await db.query(
                        "DELETE FROM livres WHERE id = $1 RETURNING *",
                        [id]
                    );
                    if (result.rowCount === 0) {
                        return res.status(404).json({
                            message: "Book not found"
                        });
                    }
                    res.status(200).json({
                        message: "Book deleted successfully"
                    });
                } catch (err) {
                    console.log(err)
                    res.status(500).json({
                        message: "server error"
                    });
                }
            });

        app.listen(5020, () => console.log("This app is listening on port 5020"))
        } catch (err) {
            console.log("Oops! something went wrong")
        }
    }

    main()

            
