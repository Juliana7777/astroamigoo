
const formulario = document.getElementById("formulario-cuestionario");
const contenedor = document.getElementById("contenedor-preguntas");
const resultado = document.getElementById("resultado");

let preguntas = [];

// Cargar las preguntas desde la base de datos
async function cargarPreguntas() {
    try {
        const respuesta = await fetch("/api/cuestionarios/3/preguntas");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las preguntas.");
        }

        preguntas = await respuesta.json();
        contenedor.innerHTML = "";

        preguntas.forEach((pregunta, indice) => {
            const bloque = document.createElement("section");
            bloque.className = "mb-5";

            const titulo = document.createElement("h2");
            titulo.textContent = `${indice + 1}. ${pregunta.enunciado}`;
            bloque.appendChild(titulo);

            pregunta.opciones.forEach((opcion) => {
                const etiqueta = document.createElement("label");
                etiqueta.className = "d-block mb-2";

                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = `pregunta-${pregunta.id_pregunta}`;
                radio.value = opcion.id_opcion;
                radio.className = "me-2";
                radio.required = true;

                etiqueta.appendChild(radio);
                etiqueta.appendChild(
                    document.createTextNode(opcion.texto_opcion)
                );

                bloque.appendChild(etiqueta);
            });

            contenedor.appendChild(bloque);
        });

    } catch (error) {
        contenedor.innerHTML = `
            <p class="text-danger">${error.message}</p>
        `;
    }
}

// Calificar las respuestas seleccionadas
formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const respuestas = preguntas.map((pregunta) => {
        const seleccionada = document.querySelector(
            `input[name="pregunta-${pregunta.id_pregunta}"]:checked`
        );

        return {
            id_pregunta: pregunta.id_pregunta,
            id_opcion: seleccionada ? Number(seleccionada.value) : null
        };
    });

    try {
        const respuesta = await fetch("/api/cuestionarios/3/calificar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ respuestas })
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo calificar el cuestionario.");
        }

        const datos = await respuesta.json();

        resultado.textContent =
            `Obtuviste ${datos.correctas} de ${datos.total} respuestas correctas.`;

    } catch (error) {
        resultado.innerHTML = `
            <p class="text-danger">${error.message}</p>
        `;
    }
});

// Ejecutar la carga de preguntas
cargarPreguntas();
