// me permite obtener los elementos del formulario, contenedor de preguntas y resultado del cuestionario y trabajar con ellos en el código JavaScript
const contenedor = document.getElementById('contenedor-preguntas');
const boton = document.getElementById('btn-calificar');
const resultado = document.getElementById('resultado');

let preguntas = [];

async function cargarPreguntas() {
    try {
        const respuesta = await fetch('/api/cuestionarios/1/preguntas');

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar las preguntas');
        }

        preguntas = await respuesta.json();

        contenedor.innerHTML = '';

        preguntas.forEach((pregunta, indice) => {

            const bloque = document.createElement('section');
            bloque.className = 'mb-5';

            const titulo = document.createElement('h2');
            titulo.textContent = `${indice + 1}. ${pregunta.enunciado}`;

            bloque.appendChild(titulo);

            pregunta.opciones.forEach(opcion => {

                const etiqueta = document.createElement('label');
                etiqueta.className = 'd-block mb-2';
                
                // Crea un input de tipo radio (bolita de opción) para cada opción de respuesta 

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `pregunta-${pregunta.id_pregunta}`;
                radio.value = opcion.id_opcion;
                radio.className = 'me-2';

                etiqueta.appendChild(radio);
                etiqueta.appendChild(document.createTextNode(opcion.texto_opcion));

                bloque.appendChild(etiqueta);
            });

            contenedor.appendChild(bloque);
        });

        boton.disabled = false;

    } catch (error) {
        contenedor.textContent = 'No fue posible cargar las preguntas.';
        console.error(error);
    }
}
// Evento click del botón de calificación, que envía las respuestas seleccionadas al servidor para su evaluación y muestra el resultado en la interfaz de usuario

boton.addEventListener('click', async () => {

    const respuestas = [];

    for (const pregunta of preguntas) {
        const seleccionada = document.querySelector(
            `input[name="pregunta-${pregunta.id_pregunta}"]:checked`
        );

        if (!seleccionada) {
            resultado.textContent = 'Responde todas las preguntas antes de continuar.';
            return;
        }

        respuestas.push({
            id_pregunta: pregunta.id_pregunta,
            id_opcion: Number(seleccionada.value) 
        });
    }
// cuando el usuario hace clic en el botón de calificación, se deshabilita el botón y se muestra un mensaje de "Calificando tus respuestas..." mientras se envían las respuestas al servidor para su evaluación

    try {
        boton.disabled = true;
        resultado.textContent = 'Calificando tus respuestas...';

        const respuesta = await fetch('/api/cuestionarios/1/calificar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                respuestas: respuestas
            })
        });

        if (!respuesta.ok) {
            throw new Error('No se pudo calificar el cuestionario.');
        }

        const nota = await respuesta.json();

        resultado.textContent =
            `Obtuviste ${nota.correctas} de ${nota.total} respuestas correctas.`;

    } catch (error) {
        resultado.textContent = 'Ocurrió un error al calificar.';
        console.error(error);

    } finally {
        boton.disabled = false;
    }

});

cargarPreguntas();
