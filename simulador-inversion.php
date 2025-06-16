<?php
/**
 * Plugin Name: Simulador de Inversión
 * Description: Un simulador de inversión que permite a los usuarios calcular rentabilidades de diferentes fondos.
 * Version: 1.0.0
 * Author: Fabian Mora
 * Text Domain: simulador-inversion
 */

// Evitar acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// Definir constantes del plugin
define('SIMULADOR_INVERSION_VERSION', '1.0.0');
define('SIMULADOR_INVERSION_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SIMULADOR_INVERSION_PLUGIN_URL', plugin_dir_url(__FILE__));

// Incluir archivos necesarios
require_once SIMULADOR_INVERSION_PLUGIN_DIR . 'includes/class-simulador-inversion.php';

// Función de activación del plugin
function simulador_inversion_activate() {
    // Código de activación si es necesario
}
register_activation_hook(__FILE__, 'simulador_inversion_activate');

// Función de desactivación del plugin
function simulador_inversion_deactivate() {
    // Código de desactivación si es necesario
}
register_deactivation_hook(__FILE__, 'simulador_inversion_deactivate');

// Inicializar el plugin
function simulador_inversion_init() {
    $plugin = new Simulador_Inversion();
    $plugin->init();
}
add_action('plugins_loaded', 'simulador_inversion_init'); 