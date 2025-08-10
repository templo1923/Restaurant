<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Cargar variables de entorno desde el archivo .env
require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Obtener los valores de las variables de entorno
$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Depuración: Mostrar los datos recibidos
        error_log(print_r($_POST, true));

        $nombre = $_POST['nombre'] ?? null;
        $cantidad = $_POST['cantidad'] ?? null;
        $estado = $_POST['estado'] ?? null;
        $fecha = $_POST['fecha'] ?? null;

        if (!empty($nombre) && !empty($cantidad) && !empty($estado) && !empty($fecha)) {
            // Validar formato de fecha (YYYY-MM-DD HH:MM:SS)
            if (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $fecha)) {
                echo json_encode(["error" => "El formato de la fecha es inválido. Use YYYY-MM-DD HH:MM:SS"]);
                exit;
            }

            // Inserción en la base de datos
            $sqlInsert = "INSERT INTO `reservas` (nombre, cantidad, estado, fecha) 
                          VALUES (:nombre, :cantidad, :estado, :fecha)";
            $stmt = $conexion->prepare($sqlInsert);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':cantidad', $cantidad);
            $stmt->bindParam(':estado', $estado);
            $stmt->bindParam(':fecha', $fecha);
            $stmt->execute();

            $lastId = $conexion->lastInsertId();

            echo json_encode([
                "mensaje" => "Reserva creada exitosamente",
                "idReserva" => $lastId,
                "nombre" => $nombre,
                "cantidad" => $cantidad,
                "estado" => $estado,
                "fecha" => $fecha
            ]);
        } else {
            echo json_encode(["error" => "Por favor, complete todos los campos correctamente"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
