<?php
declare(strict_types=1);

// ============================================================================
// Configuración de conexión a la base de datos.
// Toma los valores de variables de entorno (definidas en el docker-compose del
// VPS). Si no existen, cae en los valores por defecto de hosting compartido de
// Hostinger (hPanel → Bases de datos → MySQL). El .htaccess ya bloquea el
// acceso directo a este archivo desde el navegador.
// ============================================================================
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'TODO_nombre_base_de_datos');
define('DB_USER', getenv('DB_USER') ?: 'TODO_usuario');
define('DB_PASS', getenv('DB_PASS') ?: 'TODO_contraseña');

function fap_db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

function fap_json(array $payload, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

const FAP_TEAMS = [
    'britannia', 'bubali', 'caiquetio', 'caravel', 'dakota',
    'la-fama', 'nacional', 'rca', 'river-plate', 'sporting',
];
