// me permite crear un servidor web utilizando Express y conectarse a una base de datos MySQL para manejar cuestionarios y calificaciones

const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000; // corre en el puerto 3000

app.use(express.json());

// Muestra en la terminal cada petición que recibe el servidor.
app.use((req, res, next) => {
    console.log('PETICIÓN RECIBIDA:', req.method, req.url);
    next();
});

// Servir los archivos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de las páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Rutas de los cuestionarios 

//1. Cuando alguien entra a estrellas.html, muestra esa página. 
app.get('/estrellas.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'estrellas.html'));
});

//2. Cuando alguien entra a sistema-solar.html, muestra esa página. 
app.get('/sistema-solar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sistema-solar.html'));
});

//3. Cuando alguien entra a galaxias.html, muestra esa página.
app.get('/galaxias.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'galaxias.html'));
});

// Conexión con MySQL
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '*******',
    database: 'ASTROAMIGO'
});

// Consultar las preguntas de un cuestionario
app.get('/api/cuestionarios/:id/preguntas', (req, res) => {

    const idCuestionario = req.params.id;

 // Esta consulta busca las preguntas y sus opciones de respuesta en la base de datos en MySQL.
    const sql = `
        SELECT
            p.id_pregunta,
            p.enunciado,
            o.id_opcion,
            o.texto_opcion
        FROM pregunta p
        INNER JOIN opcion_respuesta o
            ON p.id_pregunta = o.id_pregunta
        WHERE p.id_cuestionario = ?
        ORDER BY p.id_pregunta, o.id_opcion
    `;

    conexion.query(sql, [idCuestionario], (error, resultados) => {

        if (error) {
            console.log('Error al consultar preguntas:', error);
            return res.status(500).json({
                mensaje: 'Error al consultar las preguntas'
            });
        }

        // Crea una lista vacía donde vamos a organizar las preguntas.
        const preguntas = [];

        resultados.forEach((fila) => {

            let pregunta = preguntas.find(
                p => p.id_pregunta === fila.id_pregunta
            );

            if (!pregunta) {
                pregunta = {
                    id_pregunta: fila.id_pregunta,
                    enunciado: fila.enunciado,
                    opciones: []
                };

                preguntas.push(pregunta);
            }

            pregunta.opciones.push({
                id_opcion: fila.id_opcion,
                texto_opcion: fila.texto_opcion
            });

        });

        // Envía las preguntas organizadas para que  el javaScript pueda mostrarlas en la página.

        res.json(preguntas);
    });

});

// Calificar las respuestas de un cuestionario


//1. Recibe las respuestas que la persona seleccionó
app.post('/api/cuestionarios/:id/calificar', (req, res) => {

    console.log('ENTRÓ A LA RUTA DE CALIFICAR');

    const idCuestionario = Number(req.params.id);
    const respuestas = req.body.respuestas;

    if (!Number.isInteger(idCuestionario) || !Array.isArray(respuestas)) {
        return res.status(400).json({
            mensaje: 'Datos inválidos.'
        });
    }

// Busca en MySQL todas las opciones del cuestionario y también cuáles son las respuestas correctas.
    const sql = `
        SELECT
            p.id_pregunta,
            o.id_opcion,
            o.es_correcta
        FROM pregunta p
        INNER JOIN opcion_respuesta o
            ON p.id_pregunta = o.id_pregunta
        WHERE p.id_cuestionario = ?
    `;

    conexion.query(sql, [idCuestionario], (error, resultados) => {

        if (error) {
            console.log('Error al calificar:', error);
            return res.status(500).json({
                mensaje: 'No fue posible calificar el cuestionario.'
            });
        }

        let correctas = 0;

        respuestas.forEach(respuesta => {

            // Busca en los resultados si la opción seleccionada pertenece a la pregunta correspondiente.

            const opcion = resultados.find(fila =>
                fila.id_pregunta === Number(respuesta.id_pregunta) &&
                fila.id_opcion === Number(respuesta.id_opcion)
            );
            
            // Comprueba si encontró la opción y si es correcta, y si es así, incrementa en 1 el contador de respuestas correctas.
            if (opcion && opcion.es_correcta === 1) {
                correctas++;
            }

        });

        res.json({
            correctas: correctas,
            total: resultados.length / 4
        });

    });

});

conexion.connect((error) => {
    if (error) {
        console.log('Error al conectar con MySQL:', error.message);
        return;
    }

    console.log('Conexión con AstroAmigo exitosa.');
});

// Comprobar que la ruta de calificación está registrada
console.log('RUTA DE CALIFICACIÓN REGISTRADA');

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`AstroAmigo está funcionando en http://localhost:${PORT}`);
});
