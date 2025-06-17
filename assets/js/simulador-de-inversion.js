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

// Función para generar opciones de plazo según el plazo mínimo y máximo
function generarOpcionesPlazo(plazo) {
    const opciones = [];
    // Si el plazo es un objeto (variable)
    if (typeof plazo === 'object' && plazo.minimo && plazo.maximo) {
        for (let i = plazo.minimo; i <= plazo.maximo; i += plazo.minimo) {
            opciones.push({
                value: i,
                label: `${i} días`
            });
        }
    } else if (typeof plazo === 'number' && plazo > 0) {
        // Si el plazo es fijo, no se generan opciones
        // (el dropdown no se muestra en este caso)
    }
    return opciones;
}

// Función para calcular la rentabilidad considerando el plazo
function calcularRentabilidadConPlazo(monto, rentabilidadAnual, plazo) {
    // Convertir la rentabilidad anual a la rentabilidad para el plazo específico
    const rentabilidadPlazo = Math.pow(1 + rentabilidadAnual, plazo / 365) - 1;
    // Calcular el resultado
    return monto * (1 + rentabilidadPlazo);
}

// Función para actualizar los fondos sugeridos en tiempo real
function actualizarFondosSugeridos() {
    const monto = parseFloat(document.getElementById('monto').value) || 0;
    const listaFondosDiv = document.getElementById('lista-fondos-filtrados');
    listaFondosDiv.innerHTML = '';

    // Filtrar fondos según el monto mínimo
    const fondosFiltrados = Object.entries(fondos).filter(([_, data]) => monto >= data.minimo);

    if (fondosFiltrados.length === 0) {
        listaFondosDiv.innerHTML = '<p>No hay fondos disponibles para el monto ingresado.</p>';
        document.getElementById('boton-simular-container').style.display = 'none';
    } else {
        fondosFiltrados.forEach(([nombre, data]) => {
            const li = document.createElement('li');
            li.classList.add('fondo_item');

            // Determinar si el fondo tiene plazo fijo o variable
            let esPlazoFijo = false;
            let textoPlazo = '';
            let mostrarSelectorPlazo = false;
            let plazoValor = 0;
            
            // Corregir la lógica para determinar el tipo de plazo
            if (data.plazo && typeof data.plazo === 'object') {
                // Caso 1: Plazo con estructura {tipo: 'fijo', valor: X} o {tipo: 'variable', minimo: X, maximo: Y}
                if (data.plazo.tipo === 'fijo') {
                    esPlazoFijo = true;
                    plazoValor = data.plazo.valor;
                    if (nombre === 'Renta Plus') {
                        textoPlazo = '40 años';
                    } else {
                        textoPlazo = `${plazoValor} días`;
                    }
                } else if (data.plazo.tipo === 'variable' || data.plazo.minimo) {
                    esPlazoFijo = false;
                    plazoValor = data.plazo.minimo;
                    textoPlazo = `${plazoValor} días`;
                    mostrarSelectorPlazo = plazoValor < 365;
                }
                // Caso 2: Plazo con estructura {minimo: X, maximo: Y}
                else if (data.plazo.minimo && data.plazo.maximo) {
                    esPlazoFijo = false;
                    plazoValor = data.plazo.minimo;
                    textoPlazo = `${plazoValor} - ${data.plazo.maximo} días`;
                    mostrarSelectorPlazo = plazoValor < 365;
                }
            } 
            // Caso 3: Plazo como número directo
            else if (typeof data.plazo === 'number' && data.plazo > 0) {
                esPlazoFijo = true;
                plazoValor = data.plazo;
                textoPlazo = `${plazoValor} días`;
            }
            // Caso 4: Si no hay información de plazo
            else {
                textoPlazo = 'No especificado';
            }

            console.log(`Fondo: ${nombre}, Plazo data:`, data.plazo, `Texto plazo: ${textoPlazo}`);

            // Obtener la rentabilidad anual
            const rentabilidadAnual = data.rentabilidades ? data.rentabilidades.anual : 0;
            const montoConRentabilidad = esPlazoFijo ? 
                calcularRentabilidadConPlazo(monto, rentabilidadAnual, plazoValor) :
                monto;

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
                        <span class="fondo-plazo">Plazo de permanencia: ${textoPlazo}</span>
                        <span class="fondo-riesgo">Perfil de riesgo: ${data.riesgo}</span>
                    </div>

                    <div class="plazo-selector" style="display: none" data-mostrar-selector="${mostrarSelectorPlazo}">
                        <label class="plazo-label">Seleccione el plazo de inversión:</label>
                        <select class="plazo-select" data-fondo="${nombre}">
                            ${generarOpcionesPlazo(data.plazo).map(opt => 
                                `<option value="${opt.value}">${opt.label}</option>`
                            ).join('')}
                        </select>
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
        });
    }
}


// Agregar event listeners para actualización en tiempo real
document.getElementById('monto').addEventListener('input', actualizarFondosSugeridos);

// Modificar el event listener para los botones de selección de fondo
document.getElementById('fondos-sugeridos').addEventListener('click', function(event) {
    if (event.target.classList.contains('seleccionar-fondo-btn')) {
        // Deseleccionar todos los fondos
        document.querySelectorAll('.fondo_item').forEach(item => {
            item.classList.remove('activo');
            const plazoSelector = item.querySelector('.plazo-selector');
            const botonSimularContainer = item.querySelector('.boton-simular-container');
            if (plazoSelector) plazoSelector.style.display = 'none';
            if (botonSimularContainer) botonSimularContainer.style.display = 'none';
        });
        
        // Agregar clase activo al fondo seleccionado
        const currentLi = event.target.closest('.fondo_item');
        currentLi.classList.add('activo');
        
        // Guardar el fondo seleccionado
        fondoSeleccionado = event.target.dataset.fondoNombre;
        
        // Obtener el monto ingresado
        const monto = parseFloat(document.getElementById('monto').value);
        const fondoData = fondos[fondoSeleccionado];
        
        // Mostrar el selector de plazo solo si está habilitado para este fondo
        const plazoSelector = currentLi.querySelector('.plazo-selector');
        if (plazoSelector && plazoSelector.dataset.mostrarSelector === 'true') {
            plazoSelector.style.display = 'block';
        }
        
        // Mostrar el botón de simular
        const botonSimularContainer = currentLi.querySelector('.boton-simular-container');
        if (botonSimularContainer) {
            botonSimularContainer.style.display = 'block';
        }
        
        // Actualizar el cálculo inicial
        const rentabilidadAnual = fondoData.rentabilidades.anual;
        const plazo = typeof fondoData.plazo === 'number' ? fondoData.plazo : 
            parseInt(currentLi.querySelector('.plazo-select')?.value || fondoData.plazo.minimo);
        
        const montoConRentabilidad = calcularRentabilidadConPlazo(monto, rentabilidadAnual, plazo);
        
        // Actualizar campos ocultos
        const rentabilidadOculta = document.querySelector('input[name="input_12"]');
        const plazoOculto = document.querySelector('input[name="input_16"]');
        if (rentabilidadOculta) rentabilidadOculta.value = formatearPorcentaje(rentabilidadAnual);
        if (plazoOculto) plazoOculto.value = plazo;
    }
});

// Agregar event listener para el selector de plazo
document.getElementById('fondos-sugeridos').addEventListener('change', function(event) {
    if (event.target.classList.contains('plazo-select')) {
        const monto = parseFloat(document.getElementById('monto').value);
        const fondoNombre = event.target.dataset.fondo;
        const fondoData = fondos[fondoNombre];
        const plazo = parseInt(event.target.value);
        
        // Calcular con la rentabilidad anual
        const rentabilidadAnual = fondoData.rentabilidades.anual;
        const montoConRentabilidad = calcularRentabilidadConPlazo(monto, rentabilidadAnual, plazo);
        
        // Actualizar el campo oculto del plazo
        const plazoOculto = document.querySelector('input[name="input_16"]');
        if (plazoOculto) plazoOculto.value = plazo;
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

    // Renderizar la lista de fondos correctamente
    function renderFondos(fondosFiltrados, monto) {
        const listaFondos = $('#lista-fondos-filtrados');
        listaFondos.empty();
        fondosFiltrados.forEach(([nombre, data]) => {
            let plazoTexto = '';
            if (data.plazo.tipo === 'fijo') {
                if (nombre === 'Renta Plus') {
                    plazoTexto = '40 años';
                } else {
                    plazoTexto = `${data.plazo.valor} días`;
                }
            } else {
                plazoTexto = `${data.plazo.minimo} días`;
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
        $('.rentabilidad-select').remove();
    });

    // Mostrar el selector de días solo para fondos de plazo variable
    function mostrarSelectorDias(fondo) {
        const plazoData = fondo.plazo;
        let selector = $('.rentabilidad-select');
        if (selector.length === 0) {
            // Si no existe, lo creamos y lo insertamos después del botón Simular
            selector = $('<select class="rentabilidad-select"></select>');
            $('.plazo-selector').after(selector);
        }
        if (plazoData.tipo === 'fijo') {
            selector.hide();
            return;
        }
        selector.empty();
        selector.html(generarOpcionesPlazo(plazoData.minimo, plazoData.maximo));
        selector.show();
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

    // Manejar clic en el botón de simular
    $(document).on('click', '.seleccionar-fondo-btn', function() {
        const fondoData = $(this).data('fondo');
        // Limpiar resultado anterior y dropdown
        $('.resultado-simulacion').remove();
        $('.rentabilidad-select').remove();
        // Guardar el fondo seleccionado para usarlo en el cálculo
        $('#simulador-progresion-container').data('fondo-seleccionado', fondoData);
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
                    <p>Plazo: ${fondoData.fondo === 'Renta Plus' ? '40 años' : plazo + ' días'}</p>
                    <p>Rentabilidad anual: ${formatearPorcentaje(rentabilidad)}</p>
                    <p>Ganancia estimada: ${ganancia.toLocaleString()} COP</p>
                    <p>Valor final estimado: ${valorFinal.toLocaleString()} COP</p>
                </div>
            `;
            $('.plazo-selector').after(resultado);
        } else {
            // Mostrar el selector de días
            mostrarSelectorDias(fondoData);
        }
    });

    // Manejar cambios en el selector de días
    $(document).on('change', '.rentabilidad-select', function() {
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
            $('.rentabilidad-select').after(resultado);
        }
    });
}); 
 