// Función auxiliar para procesar shortcodes de rentabilidad
function get_rentabilidad_from_shortcode($shortcode) {
    $output = do_shortcode($shortcode);
    $cleaned_output = str_replace(',', '.', trim($output));
    $cleaned_output = str_replace('%', '', $cleaned_output);
    $rentabilidad = (float) $cleaned_output;
    return ($rentabilidad > 1) ? $rentabilidad / 100 : $rentabilidad;
}

// Datos de los fondos de inversión
function get_fondos_data() {
    return [
        "Global Vista" => [
            "shortcode_mes"    => '[Fondo fondo="1" columna="Mes"]',
            "shortcode_6meses" => '[Fondo fondo="1" columna="Semestre"]',
            "shortcode_ytd"    => '[Fondo fondo="1" columna="Corrido"]',
            "shortcode_anual"  => '[Fondo fondo="1" columna="Anual"]',
            "minimo"           => 1000,
            "riesgo"           => "Conservador",
            "plazo"            => 1
        ],
        "GS Acciones" => [
            "shortcode_mes"    => '[Fondo fondo="3" columna="Mes"]',
            "shortcode_6meses" => '[Fondo fondo="3" columna="Semestre"]',
            "shortcode_ytd"    => '[Fondo fondo="3" columna="Corrido"]',
            "shortcode_anual"  => '[Fondo fondo="3" columna="Anual"]',
            "minimo"           => 100000,
            "riesgo"           => "Arriesgado",
            "plazo"            => 15
        ],
        "COF Facturas" => [
            "shortcode_mes"    => '[Fondo fondo="2" columna="Mes"]',
            "shortcode_6meses" => '[Fondo fondo="2" columna="Semestre"]',
            "shortcode_ytd"    => '[Fondo fondo="2" columna="Corrido"]',
            "shortcode_anual"  => '[Fondo fondo="2" columna="Anual"]',
            "minimo"           => 5000000,
            "riesgo"           => "Arriesgado",
            "plazo"            => 90
        ],
        "COF Títulos Valores" => [
            "shortcode_mes"    => '[Fondo fondo="5" columna="Mes"]',
            "shortcode_6meses" => '[Fondo fondo="5" columna="Semestre"]',
            "shortcode_ytd"    => '[Fondo fondo="5" columna="Corrido"]',
            "shortcode_anual"  => '[Fondo fondo="5" columna="Anual"]',
            "minimo"           => 5000000,
            "riesgo"           => "Arriesgado",
            "plazo"            => 180
        ],
        "Renta Crédito" => [
            "shortcode_mes"    => '[Fondo fondo="10" columna="Mes"]',
            "shortcode_6meses" => '[Fondo fondo="10" columna="Semestre"]',
            "shortcode_ytd"    => '[Fondo fondo="10" columna="Corrido"]',
            "shortcode_anual"  => '[Fondo fondo="10" columna="Anual"]',
            "minimo"           => 200000,
            "riesgo"           => "Arriesgado",
            "plazo"            => 365
        ],
        "Renta Fija MP" => [
            "shortcode_mes"    => '[Fondo fondo="110" columna="Mes"]',
            "shortcode_6meses" => '[Fondo fondo="110" columna="Semestre"]',
            "shortcode_ytd"    => '[Fondo fondo="110" columna="Corrido"]',
            "shortcode_anual"  => '[Fondo fondo="110" columna="Anual"]',
            "minimo"           => 50000,
            "riesgo"           => "Moderado",
            "plazo"            => 90
        ],
        "Renta Plus" => [
            "shortcode_mes"    => '[Fondo fondo="109" columna="Mes"]',
            "shortcode_6meses" => '[Fondo fondo="109" columna="Semestre"]',
            "shortcode_ytd"    => '[Fondo fondo="109" columna="Corrido"]',
            "shortcode_anual"  => '[Fondo fondo="109" columna="Anual"]',
            "minimo"           => 10000000,
            "riesgo"           => "Arriesgado",
            "plazo"            => 480
        ],
        "Rentamás" => [
            "shortcode_mes"    => '[Fondo fondo="102" columna="Mes"]',
            "shortcode_6meses" => '[Fondo fondo="102" columna="Semestre"]',
            "shortcode_ytd"    => '[Fondo fondo="102" columna="Corrido"]',
            "shortcode_anual"  => '[Fondo fondo="102" columna="Anual"]',
            "minimo"           => 3000000,
            "riesgo"           => "Arriesgado",
            "plazo"            => 90
        ]
    ];
}

// Función para procesar los datos de los fondos
function procesar_datos_fondos($fondos_data) {
    $rentabilidades = [];
    foreach ($fondos_data as $nombre => $data) {
        $rentabilidades[$nombre] = [
            "mes"   => get_rentabilidad_from_shortcode($data['shortcode_mes']),
            "seisM" => get_rentabilidad_from_shortcode($data['shortcode_6meses']),
            "ytd"   => get_rentabilidad_from_shortcode($data['shortcode_ytd']),
            "anual" => get_rentabilidad_from_shortcode($data['shortcode_anual']),
        ];
    }

    $all_funds_data = [];
    foreach ($fondos_data as $nombre => $data) {
        $all_funds_data[$nombre] = [
            "rentabilidades" => $rentabilidades[$nombre],
            "minimo"         => $data["minimo"],
            "riesgo"         => $data["riesgo"],
            "plazo"          => $data["plazo"]
        ];
    }

    return $all_funds_data;
}

// Shortcode principal del simulador
add_shortcode('simulador-progresion', function() {
    ob_start();
    
    // Obtener y procesar datos
    $fondos_data = get_fondos_data();
    $all_funds_data = procesar_datos_fondos($fondos_data);
    $json_fondos_data = json_encode($all_funds_data);
    $tasa_usd_cop = 4000; // Tasa de cambio fija
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

                <!-- Lista de fondos sugeridos -->
                <div id="fondos-sugeridos">
                    <ul id="lista-fondos-filtrados">
                        <!-- Los fondos filtrados se insertarán aquí por JS -->
                    </ul>
                </div>                
            </div>
        </div>

        <!-- Formulario de datos básicos -->
        <div id="formulario-datos">
            <div class="encabezado-formulario">
                <h3>Datos básicos</h3>
                <button type="button" id="boton-regresar">← Regresar</button>
            </div>
            <?php echo do_shortcode('[gravityform id="12" title="false" ajax="true"]'); ?>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer">
            <p>Esta es una simulación basada en rentabilidades históricas. Los resultados no garantizan rendimientos futuros.</p>
        </div>
    </div>
    <?php
    return ob_get_clean();
});

