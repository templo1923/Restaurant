<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

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

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);

        $idReserva = $data['idReserva'] ?? null;
        $nuevoNombre = $data['nombre'] ?? null;
        $nuevaCantidad = $data['cantidad'] ?? null;
        $nuevoEstado = $data['estado'] ?? null;
        $nuevaFecha = $data['fecha'] ?? null;

        // Verificar que el ID de la reserva no esté vacío
        if (empty($idReserva)) {
            echo json_encode(["error" => "ID de reserva es obligatorio"]);
            exit;
        }

        // Validar formato de fecha si se envía
        if (!empty($nuevaFecha) && !preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $nuevaFecha)) {
            echo json_encode(["error" => "El formato de la fecha es inválido. Use YYYY-MM-DD HH:MM:SS"]);
            exit;
        }

        // Construir la consulta SQL de actualización
        $sqlUpdate = "UPDATE reservas SET 
            nombre = COALESCE(:nombre, nombre), 
            cantidad = COALESCE(:cantidad, cantidad), 
            estado = COALESCE(:estado, estado),
            fecha = COALESCE(:fecha, fecha)
        WHERE idReserva = :idReserva";

        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':nombre', $nuevoNombre);
        $sentenciaUpdate->bindParam(':cantidad', $nuevaCantidad);
        $sentenciaUpdate->bindParam(':estado', $nuevoEstado);
        $sentenciaUpdate->bindParam(':fecha', $nuevaFecha);
        $sentenciaUpdate->bindParam(':idReserva', $idReserva, PDO::PARAM_INT);

        // Ejecutar la consulta y verificar el resultado
        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Reserva actualizada correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar la reserva: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
