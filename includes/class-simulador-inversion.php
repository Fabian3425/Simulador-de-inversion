<?php
/**
 * Clase principal del plugin Simulador de Inversión
 */
class Simulador_Inversion {
    /**
     * Inicializa el plugin
     */
    public function init() {
        // Registrar shortcodes
        add_shortcode('simulador-progresion', array($this, 'render_simulador'));
        
        // Registrar scripts y estilos
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Registra y carga los scripts y estilos necesarios
     */
    public function enqueue_scripts() {
        // Registrar y cargar CSS
        wp_register_style(
            'simulador-inversion-css',
            SIMULADOR_INVERSION_PLUGIN_URL . 'assets/css/simulador-de-inversion.css',
            array(),
            SIMULADOR_INVERSION_VERSION
        );

        // Registrar y cargar JavaScript
        wp_register_script(
            'simulador-inversion-js',
            SIMULADOR_INVERSION_PLUGIN_URL . 'assets/js/simulador-de-inversion.js',
            array('jquery'),
            SIMULADOR_INVERSION_VERSION,
            true
        );

        // Cargar los estilos y scripts
        wp_enqueue_style('simulador-inversion-css');
        wp_enqueue_script('simulador-inversion-js');
    }

    /**
     * Función para obtener la rentabilidad desde un shortcode
     */
    private function get_rentabilidad_from_shortcode($shortcode) {
        $output = do_shortcode($shortcode);
        $cleaned_output = str_replace(',', '.', trim($output));
        $cleaned_output = str_replace('%', '', $cleaned_output);
        $rentabilidad = (float) $cleaned_output;

        if ($rentabilidad > 1) {
            return $rentabilidad / 100;
        }

        return $rentabilidad;
    }

    /**
     * Renderiza el simulador
     */
    public function render_simulador() {
        ob_start();

        $fondos_data = [
            "Global Vista" => [
                "shortcode_mes"    => '[Fondo fondo="1" columna="Mes"]  ',
                "shortcode_6meses" => '[Fondo fondo="1" columna="Semestre"]',
                "shortcode_ytd"    => '[Fondo fondo="1" columna="Corrido"]',
                "shortcode_anual"  => '[Fondo fondo="1" columna="Anual"]',
                "minimo"           => 1000,
                "riesgo"           => "Conservador",
                "plazo"            => [
                    "tipo" => "variable",
                    "minimo" => 1,
                    "maximo" => 360
                ]
            ],
            "GS Acciones" => [
                "shortcode_mes"    => '[Fondo fondo="3" columna="Mes"]  ',
                "shortcode_6meses" => '[Fondo fondo="3" columna="Semestre"]',
                "shortcode_ytd"    => '[Fondo fondo="3" columna="Corrido"]',
                "shortcode_anual"  => '[Fondo fondo="3" columna="Anual"]',
                "minimo"           => 100000,
                "riesgo"           => "Arriesgado",
                "plazo"            => [
                    "tipo" => "variable",
                    "minimo" => 15,
                    "maximo" => 360
                ]
            ],
            "COF Facturas" => [
                "shortcode_mes"    => '[Fondo fondo="2" columna="Mes"]  ',
                "shortcode_6meses" => '[Fondo fondo="2" columna="Semestre"]',
                "shortcode_ytd"    => '[Fondo fondo="2" columna="Corrido"]',
                "shortcode_anual"  => '[Fondo fondo="2" columna="Anual"]',
                "minimo"           => 5000000,
                "riesgo"           => "Arriesgado",
                "plazo"            => [
                    "tipo" => "variable",
                    "minimo" => 90,
                    "maximo" => 360
                ]
            ],
            "COF Títulos Valores" => [
                "shortcode_mes"    => '[Fondo fondo="5" columna="Mes"]  ',
                "shortcode_6meses" => '[Fondo fondo="5" columna="Semestre"]',
                "shortcode_ytd"    => '[Fondo fondo="5" columna="Corrido"]',
                "shortcode_anual"  => '[Fondo fondo="5" columna="Anual"]',
                "minimo"           => 5000000,
                "riesgo"           => "Arriesgado",
                "plazo"            => [
                    "tipo" => "variable",
                    "minimo" => 180,
                    "maximo" => 360
                ]
            ],
            "Renta Crédito" => [
                "shortcode_mes"    => '[Fondo fondo="10" columna="Mes"]  ',
                "shortcode_6meses" => '[Fondo fondo="10" columna="Semestre"]',
                "shortcode_ytd"    => '[Fondo fondo="10" columna="Corrido"]',
                "shortcode_anual"  => '[Fondo fondo="10" columna="Anual"]',
                "minimo"           => 200000,
                "riesgo"           => "Arriesgado",
                "plazo"            => [
                    "tipo" => "fijo",
                    "valor" => 365
                ]
            ],
            "Renta Fija MP" => [
                "shortcode_mes"    => '[Fondo fondo="110" columna="Mes"]  ',
                "shortcode_6meses" => '[Fondo fondo="110" columna="Semestre"]',
                "shortcode_ytd"    => '[Fondo fondo="110" columna="Corrido"]',
                "shortcode_anual"  => '[Fondo fondo="110" columna="Anual"]',
                "minimo"           => 50000,
                "riesgo"           => "Moderado",
                "plazo"            => [
                    "tipo" => "variable",
                    "minimo" => 90,
                    "maximo" => 360
                ]
            ],
            "Renta Plus" => [
                "shortcode_mes"    => '[Fondo fondo="109" columna="Mes"]  ',
                "shortcode_6meses" => '[Fondo fondo="109" columna="Semestre"]',
                "shortcode_ytd"    => '[Fondo fondo="109" columna="Corrido"]',
                "shortcode_anual"  => '[Fondo fondo="109" columna="Anual"]',
                "minimo"           => 10000000,
                "riesgo"           => "Arriesgado",
                "plazo"            => [
                    "tipo" => "fijo",
                    "valor" => 14600 // 40 años en días
                ]
            ],
            "Rentamás" => [
                "shortcode_mes"    => '[Fondo fondo="102" columna="Mes"]',
                "shortcode_6meses" => '[Fondo fondo="102" columna="Semestre"]',
                "shortcode_ytd"    => '[Fondo fondo="102" columna="Corrido"]',
                "shortcode_anual"  => '[Fondo fondo="102" columna="Anual"]',
                "minimo"           => 3000000,
                "riesgo"           => "Arriesgado",
                "plazo"            => [
                    "tipo" => "variable",
                    "minimo" => 90,
                    "maximo" => 360
                ]
            ]
        ];

        $rentabilidades = [];
        foreach ($fondos_data as $nombre => $data) {
            $rentabilidades[$nombre] = [
                "mes"   => $this->get_rentabilidad_from_shortcode($data['shortcode_mes']),
                "seisM" => $this->get_rentabilidad_from_shortcode($data['shortcode_6meses']),
                "ytd"   => $this->get_rentabilidad_from_shortcode($data['shortcode_ytd']),
                "anual" => $this->get_rentabilidad_from_shortcode($data['shortcode_anual']),
            ];
        }
    
        // 5. Combinar datos fijos + rentabilidades en un solo array para pasar a JS
        $all_funds_data = [];
        foreach ($fondos_data as $nombre => $data) {
            $all_funds_data[$nombre] = [
                "rentabilidades" => $rentabilidades[$nombre],  // Array con las 4 métricas
                "minimo"         => $data["minimo"],
                "riesgo"         => $data["riesgo"],
                "plazo"          => $data["plazo"]
            ];
        }
    
        // 6. Convertir todo a JSON
        $json_fondos_data = json_encode($all_funds_data);
    
        // Tasa de cambio fija para el cálculo de mínimos (1 USD = 4000 COP)
        $tasa_usd_cop = 4000;

        // Incluir la plantilla HTML
        include SIMULADOR_INVERSION_PLUGIN_DIR . 'templates/simulador-template.php';

        return ob_get_clean();
    }
} 