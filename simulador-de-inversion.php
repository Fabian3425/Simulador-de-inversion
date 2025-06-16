<?php

function get_rentabilidad_from_shortcode($shortcode) {
    // Ejecuta el shortcode y captura la salida como string
    $output = do_shortcode($shortcode);

    // Limpieza básica: 
    // - quitar espacios en los extremos (trim)
    // - cambiar comas por puntos
    // - eliminar el símbolo '%' si existe
    $cleaned_output = str_replace(',', '.', trim($output));
    $cleaned_output = str_replace('%', '', $cleaned_output);

    // Convertir a float
    $rentabilidad = (float) $cleaned_output;

    // Si el número es mayor que 1, lo tomamos como porcentaje (por ejemplo, 8.57 significa 8.57%)
    // y lo convertimos a su equivalente decimal (8.57 / 100 = 0.0857)
    if ($rentabilidad > 1) {
        return $rentabilidad / 100;
    }

    // Si ya es un valor decimal (<= 1), lo retornamos tal cual
    return $rentabilidad;
}

// 2. Registrar el shortcode [simulador-progresion]
add_shortcode('simulador-progresion', function() {
    ob_start();

    // 7. Generar el HTML del simulador, inyectando el JSON en data-fondos
    ?>
    <div id="simulador-progresion-container" data-fondos='<?php echo esc_attr($json_fondos_data); ?>'>
        
        <h2>Simulador de Inversión</h2>
        <p>En esta sección, puede simular su inversión de acuerdo con el monto que desea invertir en COP (Pesos Colombianos).</p>
        
        <!-- Contenedor del simulador -->
        <div id="contenedor-simulador">
            <div id="paso1">
                <form id="formSimulador">
                    <div class="contenedor_campos">
                        <div class="campo">
                            <label for="monto">Monto a invertir (COP):</label>
                            <input type="number" id="monto" name="monto" min="0" step="1000" required>
                            <div class="error-mensaje" id="error-monto"></div>
                        </div>
                    </div>
                </form>

                <!-- Lista de fondos sugeridos (visible inmediatamente) -->
                <div id="fondos-sugeridos">
                    <ul id="lista-fondos-filtrados">
                        <!-- Los fondos filtrados se insertarán aquí por JS -->
                    </ul>
				</div>                
            </div>
        </div>

        <!-- Formulario de datos básicos (inicialmente oculto) -->
        <div id="formulario-datos">
            <div class="encabezado-formulario">
                <h3>Datos básicos</h3>
                <button type="button" id="boton-regresar">← Regresar</button>
            </div>
            <?php 
            echo do_shortcode('[gravityform id="12" title="false" ajax="true"]'); 
            ?>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer">
            <p>Esta es una simulación basada en rentabilidades históricas. Los resultados no garantizan rendimientos futuros.</p>
        </div>
    </div>

    <!-- Incluir los archivos CSS y JavaScript -->


    <?php
    return ob_get_clean();
});

