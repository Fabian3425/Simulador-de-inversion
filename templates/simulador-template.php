<?php
/**
 * Template para el simulador de inversión
 */
?>
<div id="simulador-progresion-container" data-fondos='<?php echo esc_html($json_fondos_data); ?>'>
    
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
        <?php 
        if (shortcode_exists('gravityform')) {
            echo do_shortcode('[gravityform id="12" title="false" ajax="true"]'); 
        }
        ?>
    </div>

    <!-- Disclaimer -->
    <div class="disclaimer">
        <p>Esta es una simulación basada en rentabilidades históricas. Los resultados no garantizan rendimientos futuros.</p>
    </div>
</div>

<!-- Template para el selector de plazo -->
<template id="plazo-selector-template">
    <div class="plazo-selector">
        <label for="plazo-inversion">Plazo de inversión (días):</label>
        <select id="plazo-inversion" name="plazo-inversion">
            <!-- Las opciones se generarán dinámicamente por JS -->
        </select>
    </div>
</template> 