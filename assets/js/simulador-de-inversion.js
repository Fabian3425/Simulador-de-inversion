// Tasa de cambio fija (se pasa desde PHP)
const TASA_USD_COP = parseFloat(document.getElementById('simulador-progresion-container').dataset.tasaUsdCop);

// 1. Leer el JSON con todas las rentabilidades y datos (minimo, riesgo, plazo)
const simuladorContainer = document.getElementById('simulador-progresion-container');
const fondos = JSON.parse(simuladorContainer.dataset.fondos);

// 2. Funciones para formatear moneda y porcentaje
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

function formatearPorcentaje(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Función para reiniciar el simulador al paso 1
function reiniciarSimulador() {
    console.log('reiniciarSimulador: Iniciando reinicio...');
    document.getElementById('paso1').style.display = 'block';
    document.getElementById('formulario-datos').style.display = 'none';
    // Opcional: Limpiar campos o mensajes de error
    document.getElementById('formSimulador').reset();
    document.getElementById('error-monto').textContent = '';
    document.getElementById('lista-fondos-filtrados').innerHTML = '';
    fondoSeleccionado = null;
    document.getElementById('boton-simular-container').style.display = 'none';
    // Asegurarse de que el contenedor principal del simulador sea visible
    document.getElementById('simulador-progresion-container').style.display = 'block';
    console.log('reiniciarSimulador: simulador-progresion-container visible.');
}

// Variable global para almacenar el fondo seleccionado
let fondoSeleccionado = null;

// Función para actualizar los fondos sugeridos en tiempo real
function actualizarFondosSugeridos() {
    const montoInput = document.getElementById('monto');
    const monto = parseFloat(montoInput.value);

    // Limpiar mensajes de error previos
    document.getElementById('error-monto').textContent = '';

    // Si no hay monto, limpiar la lista
    if (!monto || monto <= 0) {
        document.getElementById('error-monto').textContent = 'Ingrese un monto válido (> 0).';
        document.getElementById('lista-fondos-filtrados').innerHTML = '';
        return;
    }

    // Encontrar el fondo con el monto mínimo más bajo
    const minimoMasBajo = Math.min(...Object.values(fondos).map(data => data.minimo));
    
    // Validar si el monto es menor al mínimo más bajo
    if (monto < minimoMasBajo) {
        document.getElementById('error-monto').textContent = `El monto mínimo de inversión es ${formatearMoneda(minimoMasBajo)}.`;
        document.getElementById('lista-fondos-filtrados').innerHTML = '';
        return;
    }

    // Filtrar fondos
    const fondosFiltrados = Object.entries(fondos).filter(([nombre, data]) => {
        return data.minimo <= monto;
    });

    // Ordenar los fondos según el monto mínimo de mayor a menor
    fondosFiltrados.sort(([, dataA], [, dataB]) => {
        return dataB.minimo - dataA.minimo;
    });

    // Mostrar lista de fondos filtrados
    const listaFondosDiv = document.getElementById('lista-fondos-filtrados');
    listaFondosDiv.innerHTML = ''; // Limpiar lista previa

    // Eliminar título previo si existe
    const existingTitle = document.querySelector('#fondos-sugeridos h3');
    if (existingTitle) {
        existingTitle.remove();
    }

    if (fondosFiltrados.length === 0) {
         listaFondosDiv.innerHTML = '<p>No hay fondos disponibles para el monto ingresado.</p>';
         document.getElementById('boton-simular-container').style.display = 'none';
    } else {
        // Agregar el título dinámicamente solo si no existe
        const tituloFondos = document.createElement('h3');
        tituloFondos.textContent = 'Fondos disponibles para invertir';
        tituloFondos.style.color = '#333';
        tituloFondos.style.marginBottom = '15px';
        tituloFondos.style.textAlign = 'center';
        tituloFondos.style.fontWeight = '600';
        document.getElementById('fondos-sugeridos').prepend(tituloFondos);

        fondosFiltrados.forEach(([nombre, data]) => {
            const li = document.createElement('li');
            li.classList.add('fondo_item');

            // Función para determinar qué opciones de rentabilidad mostrar según el plazo
            function getRentabilidadOptions(plazo) {
                const options = [];
                if (plazo <= 30) {
                    options.push({ value: 'mes', label: 'Último mes' });
                }
                if (plazo <= 180) {
                    options.push({ value: 'seisM', label: 'Últimos 6 meses' });
                }
                if (plazo <= 365) {
                    options.push({ value: 'ytd', label: 'Año corrido' });
                }
                options.push({ value: 'anual', label: 'Último año' });
                return options;
            }

            // Obtener opciones de rentabilidad según el plazo
            const rentabilidadOptions = getRentabilidadOptions(data.plazo);
            
            // Usar la primera opción disponible como valor por defecto
            const defaultRentabilidad = rentabilidadOptions[0].value;
            const rentabilidad = data.rentabilidades[defaultRentabilidad];
            const montoConRentabilidad = calcularRentabilidadConPlazo(monto, rentabilidad, data.plazo);

            li.innerHTML = `
                <div class="fondo-contenedor">
	<div class="fondo-titulo">
		<strong>${nombre}</strong>
	</div>

	<div class="fondo-monto-invertido">
		<strong>Monto invertido:</strong> ${formatearMoneda(monto)} COP
	</div>

	<div class="fondo-info">
		<span class="fondo-minimo">Mínimo: ${formatearMoneda(data.minimo)}</span>
		<span class="fondo-plazo">Plazo de permanencia: ${data.plazo} días</span>
		<span class="fondo-riesgo">Perfil de riesgo: ${data.riesgo}</span>
	</div>

	<div class="rentabilidad-details" style="display: none;">
		<div class="fondo-rentabilidad">
			<label class="rentabilidad-label">Seleccione período de rentabilidad:</label>
			<select class="rentabilidad-select" data-fondo="${nombre}">
				${rentabilidadOptions.map(opt => 
					`<option value="${opt.value}">${opt.label}</option>`
				).join('')}
			</select>
			<div class="rentabilidad-valor">
				Rentabilidad: <span class="rentabilidad-numero">${formatearPorcentaje(rentabilidad)}</span>
			</div>
		</div>
	</div>

	<div class="fondo-boton">
		<button type="button" class="seleccionar-fondo-btn" data-fondo-nombre="${nombre}">
			Seleccionar este fondo
		</button>
	</div>
	<div class="boton-simular-container" style="display: none;">
		<button type="button" class="boton-simular" data-fondo-nombre="${nombre}">Simular</button>
	</div>
</div>
            `;
            listaFondosDiv.appendChild(li);

            // Agregar event listener para el selector de rentabilidad DENTRO de este li
            const select = li.querySelector('.rentabilidad-select');
            select.addEventListener('change', function() {
                const tipoRentabilidad = this.value;
                const rentabilidad = data.rentabilidades[tipoRentabilidad];
                const montoConRentabilidad = calcularRentabilidadConPlazo(monto, rentabilidad, data.plazo);
                
                // Actualizar los valores mostrados DENTRO de este li
                li.querySelector('.rentabilidad-numero').textContent = formatearPorcentaje(rentabilidad);
                //li.querySelector('.fondo_resultado strong').textContent = formatearMoneda(montoConRentabilidad);
                
                // Actualizar el campo oculto de rentabilidad y período cuando cambia el selector
                const resultadoFormateado = formatearMoneda(montoConRentabilidad);
                const rentabilidadOculta = document.querySelector('input[name="input_12"]');
                const periodoRentabilidadCodigoOculto = document.querySelector('input[name="input_16"]');
                console.log('Selector de rentabilidad cambiado. Tipo de rentabilidad:', tipoRentabilidad); // Debugging

                // Solo actualiza si el fondo seleccionado actualmente coincide con este selector
                if (fondoSeleccionado === nombre) {
                     if (rentabilidadOculta) rentabilidadOculta.value = formatearPorcentaje(rentabilidad);
                     if (periodoRentabilidadCodigoOculto) periodoRentabilidadCodigoOculto.value = tipoRentabilidad;
                     console.log('Campos ocultos actualizados para fondo seleccionado.'); // Debugging
                }
            });
        });
    }
}

// Función para calcular la rentabilidad considerando el plazo
function calcularRentabilidadConPlazo(monto, rentabilidad, plazo) {
    // Calcular el resultado simplemente multiplicando el monto por la rentabilidad
    return monto * (1 + rentabilidad);
}

// Agregar event listeners para actualización en tiempo real
document.getElementById('monto').addEventListener('input', actualizarFondosSugeridos);

// Modificar el event listener para los botones de selección de fondo
document.getElementById('fondos-sugeridos').addEventListener('click', function(event) {
    if (event.target.classList.contains('seleccionar-fondo-btn')) {
        // Deseleccionar todos los fondos y ocultar detalles de rentabilidad y botones de simular
        document.querySelectorAll('.fondo_item').forEach(item => {
            item.classList.remove('activo');
            const rentabilidadDetails = item.querySelector('.rentabilidad-details');
            const botonSimularContainer = item.querySelector('.boton-simular-container');
            if (rentabilidadDetails) {
                rentabilidadDetails.style.display = 'none';
            }
            if (botonSimularContainer) {
                botonSimularContainer.style.display = 'none';
            }
        });
        
        // Agregar clase activo al fondo seleccionado
        const currentLi = event.target.closest('.fondo_item');
        currentLi.classList.add('activo');
        
        // Guardar el fondo seleccionado
        fondoSeleccionado = event.target.dataset.fondoNombre;
        
        // Obtener el monto ingresado
        const monto = parseFloat(document.getElementById('monto').value);

        // Mostrar los detalles de rentabilidad SOLO para el fondo seleccionado
        const rentabilidadDetails = currentLi.querySelector('.rentabilidad-details');
        if (rentabilidadDetails) {
            rentabilidadDetails.style.display = 'block';
        }

        // Mostrar el botón de simular SOLO para el fondo seleccionado
        const botonSimularContainer = currentLi.querySelector('.boton-simular-container');
        if (botonSimularContainer) {
            botonSimularContainer.style.display = 'block';
        }
        
        // Obtener el tipo de rentabilidad seleccionado para este fondo
        const rentabilidadSelect = currentLi.querySelector('.rentabilidad-select');
        const tipoRentabilidad = rentabilidadSelect.value;

        // Obtener el plazo de permanencia del fondo
        const plazoPermanencia = fondos[fondoSeleccionado].plazo;
        
        // Calcular la rentabilidad según el período seleccionado
        const rentabilidad = fondos[fondoSeleccionado].rentabilidades[tipoRentabilidad];
        
        // Calcular el resultado
        const montoConRentabilidad = calcularRentabilidadConPlazo(monto, rentabilidad, plazoPermanencia);
        
        // Formatear el resultado
        const resultadoFormateado = formatearMoneda(montoConRentabilidad);
        
        // Crear o actualizar los campos ocultos (o visibles de Gravity Forms)
        const campos = {
            'input_8': resultadoFormateado,
            'input_10': monto,
            'input_11': fondoSeleccionado,
            'input_12': formatearPorcentaje(rentabilidad),
            'input_13': plazoPermanencia,
            'input_14': `${plazoPermanencia} ${plazoPermanencia === 1 ? 'Día' : 'Días'}`,
            'input_15': fondos[fondoSeleccionado].riesgo,
            'input_16': tipoRentabilidad
        };

        // Actualizar cada campo
        Object.entries(campos).forEach(([name, value]) => {
            const fieldId = name.split('_')[1];
            const targetId = `input_12_${fieldId}`;
            let inputElement = document.getElementById(targetId);

            if (inputElement) {
                console.log(`Actualizando campo visible ${targetId} con valor:`, value);
                inputElement.value = value;
            } else {
                inputElement = document.createElement('input');
                inputElement.type = 'hidden';
                inputElement.name = name;
                document.querySelector('.gform_body').appendChild(inputElement);
                console.log(`Creando campo oculto ${name} con valor:`, value);
                inputElement.value = value;
            }
        });
    }
});

// Agregar event listener para los botones de simular
document.getElementById('fondos-sugeridos').addEventListener('click', function(event) {
    if (event.target.classList.contains('boton-simular')) {
        console.log('Boton Simular clickeado.');
        // Esconder el paso 1 y mostrar el formulario de datos
        document.getElementById('paso1').style.display = 'none';
        document.getElementById('formulario-datos').style.display = 'block';
        console.log('paso1 oculto, formulario-datos visible.');

        // Asegurarse de que el campo visible "Plazo de permanencia" se actualice
        const plazoPermanenciaInput = document.getElementById('input_12_14');
        if (plazoPermanenciaInput && fondoSeleccionado) {
            const plazo = fondos[fondoSeleccionado].plazo;
            const plazoFormateado = `${plazo} ${plazo === 1 ? 'Día' : 'Días'}`;
            console.log('Intentando establecer plazo en input_12_14:', plazoFormateado);
            plazoPermanenciaInput.value = plazoFormateado;
        } else {
            console.log('No se encontró input_12_14 o fondoSeleccionado es nulo.', {plazoPermanenciaInput, fondoSeleccionado});
        }

        // Hacer scroll suave hacia el formulario
        const contenedorSimulador = document.getElementById('simulador-progresion-container');
        if (contenedorSimulador) {
            contenedorSimulador.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Agregar event listener para el botón de regresar
document.getElementById('boton-regresar').addEventListener('click', function() {
    console.log('Boton Regresar clickeado.');
    reiniciarSimulador();
    actualizarFondosSugeridos();
    console.log('Regreso al paso 1 completado.');
});

jQuery(document).on('gform_post_render', function(event, form_id, current_page) {
    if (form_id === 12) {
        // Ocultar el encabezado del formulario inmediatamente
//         const encabezadoFormulario = document.querySelector('.encabezado-formulario');
//         if (encabezadoFormulario) {
//             encabezadoFormulario.style.display = 'none';
//         }

        // También ocultar el encabezado cuando se muestre la confirmación
        const confirmationMessage = document.querySelector('.confirmation-container');
        if (confirmationMessage) {
            // Asegurarse de que el encabezado esté oculto
            if (encabezadoFormulario) {
                encabezadoFormulario.style.display = 'none';
            }
        }
    }
});

jQuery(document).ready(function($) {
    // Función para generar opciones del selector de plazo
    function generarOpcionesPlazo(minimo, maximo) {
        let opciones = '';
        for (let i = minimo; i <= maximo; i += minimo) {
            opciones += `<option value="${i}">${i} días</option>`;
        }
        return opciones;
    }

    // Función para mostrar el selector de plazo
    function mostrarSelectorPlazo(fondo) {
        const plazoData = fondo.plazo;
        const selectorContainer = $('.plazo-selector');
        if (plazoData.tipo === 'fijo') {
            selectorContainer.hide();
            return;
        }
        const select = $('#plazo-inversion');
        select.empty();
        select.html(generarOpcionesPlazo(plazoData.minimo, plazoData.maximo));
        selectorContainer.show();
    }

    // Función para calcular la rentabilidad según el plazo
    function calcularRentabilidad(monto, rentabilidad, plazo) {
        // Convertir la rentabilidad anual a diaria
        const rentabilidadDiaria = Math.pow(1 + rentabilidad, 1/365) - 1;
        // Calcular el valor final
        const valorFinal = monto * Math.pow(1 + rentabilidadDiaria, plazo);
        return valorFinal;
    }

    // Función para formatear porcentaje
    function formatearPorcentaje(valor) {
        return (valor * 100).toFixed(2) + '%';
    }

    // Renderizar la lista de fondos correctamente
    function renderFondos(fondosFiltrados, monto) {
        const listaFondos = $('#lista-fondos-filtrados');
        listaFondos.empty();
        fondosFiltrados.forEach(([nombre, data]) => {
            let plazoTexto = '';
            if (data.plazo.tipo === 'fijo') {
                plazoTexto = `${data.plazo.valor} días`;
            } else {
                plazoTexto = `Mínimo ${data.plazo.minimo} días`;
            }
            const item = $(`
                <li class="fondo_item">
                    <div class="fondo-contenedor">
                        <h3 class="fondo-titulo">${nombre}</h3>
                        <div class="fondo-info">
                            <p>Monto mínimo: ${data.minimo.toLocaleString()} COP</p>
                            <p>Riesgo: ${data.riesgo}</p>
                            <span class="fondo-plazo">Plazo de permanencia: ${plazoTexto}</span>
                        </div>
                        <button class="seleccionar-fondo-btn" data-fondo='${JSON.stringify(data)}'>
                            Simular
                        </button>
                    </div>
                </li>
            `);
            listaFondos.append(item);
        });
    }

    // Manejar cambios en el monto
    $('#monto').on('input', function() {
        const monto = parseFloat($(this).val()) || 0;
        const fondos = JSON.parse($('#simulador-progresion-container').data('fondos'));
        // Filtrar fondos según el monto mínimo
        const fondosFiltrados = Object.entries(fondos).filter(([_, data]) => monto >= data.minimo);
        renderFondos(fondosFiltrados, monto);
        // Ocultar selector y resultado al cambiar monto
        $('.plazo-selector').hide();
        $('.resultado-simulacion').remove();
    });

    // Manejar clic en el botón de simular
    $(document).on('click', '.seleccionar-fondo-btn', function() {
        const fondoData = $(this).data('fondo');
        mostrarSelectorPlazo(fondoData);
        // Guardar el fondo seleccionado para usarlo en el cálculo
        $('#simulador-progresion-container').data('fondo-seleccionado', fondoData);
        // Limpiar resultado anterior
        $('.resultado-simulacion').remove();
        // Si el fondo es de plazo fijo, calcular de una vez
        if (fondoData.plazo.tipo === 'fijo') {
            const monto = parseFloat($('#monto').val()) || 0;
            const plazo = fondoData.plazo.valor;
            const rentabilidad = fondoData.rentabilidades.anual;
            const valorFinal = calcularRentabilidad(monto, rentabilidad, plazo);
            const ganancia = valorFinal - monto;
            const resultado = `
                <div class="resultado-simulacion">
                    <h4>Resultado de la simulación</h4>
                    <p>Monto inicial: ${monto.toLocaleString()} COP</p>
                    <p>Plazo: ${plazo} días</p>
                    <p>Rentabilidad anual: ${formatearPorcentaje(rentabilidad)}</p>
                    <p>Ganancia estimada: ${ganancia.toLocaleString()} COP</p>
                    <p>Valor final estimado: ${valorFinal.toLocaleString()} COP</p>
                </div>
            `;
            $('.plazo-selector').after(resultado);
        }
    });

    // Manejar cambios en el selector de plazo
    $(document).on('change', '#plazo-inversion', function() {
        const plazo = parseInt($(this).val());
        const fondoData = $('#simulador-progresion-container').data('fondo-seleccionado');
        const monto = parseFloat($('#monto').val()) || 0;
        if (fondoData && monto > 0) {
            const rentabilidad = fondoData.rentabilidades.anual;
            const valorFinal = calcularRentabilidad(monto, rentabilidad, plazo);
            const ganancia = valorFinal - monto;
            const resultado = `
                <div class="resultado-simulacion">
                    <h4>Resultado de la simulación</h4>
                    <p>Monto inicial: ${monto.toLocaleString()} COP</p>
                    <p>Plazo: ${plazo} días</p>
                    <p>Rentabilidad anual: ${formatearPorcentaje(rentabilidad)}</p>
                    <p>Ganancia estimada: ${ganancia.toLocaleString()} COP</p>
                    <p>Valor final estimado: ${valorFinal.toLocaleString()} COP</p>
                </div>
            `;
            $('.resultado-simulacion').remove();
            $('.plazo-selector').after(resultado);
        }
    });
}); 
 