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
    $dsn = "mysql:host=$servidor;dbname=$dbname;charset=utf8mb4";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $idPedido = isset($_GET['idPedido']) ? $_GET['idPedido'] : null;
        $data = json_decode(file_get_contents("php://input"), true);
        $nuevoEstado = isset($data['estado']) ? $data['estado'] : null;

        // Validar que se haya proporcionado un ID de pedido y un nuevo estado
        if ($idPedido && $nuevoEstado !== null) {
            // Iniciar una transacción para asegurar que ambas actualizaciones se realicen correctamente
            $conexion->beginTransaction();

            try {
                // Actualizar el estado del pedido
                $sqlUpdatePedido = "UPDATE pedidos SET estado = :estado WHERE idPedido = :idPedido";
                $sentenciaUpdatePedido = $conexion->prepare($sqlUpdatePedido);
                $sentenciaUpdatePedido->bindParam(':estado', $nuevoEstado);
                $sentenciaUpdatePedido->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);

                if ($sentenciaUpdatePedido->execute()) {
                    // Si el nuevo estado es "Entregado", actualizar los estados de los productos en el JSON
                    if (strtolower($nuevoEstado) === 'entregado') {
                        // Obtener los productos actuales
                        $sqlGetProductos = "SELECT productos FROM pedidos WHERE idPedido = :idPedido";
                        $sentenciaGetProductos = $conexion->prepare($sqlGetProductos);
                        $sentenciaGetProductos->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);
                        $sentenciaGetProductos->execute();
                        $pedido = $sentenciaGetProductos->fetch(PDO::FETCH_ASSOC);

                        if ($pedido && isset($pedido['productos'])) {
                            $productos = json_decode($pedido['productos'], true);
                            if (is_array($productos)) {
                                // Actualizar el estado de cada producto
                                foreach ($productos as &$producto) {
                                    $producto['estado'] = 'Entregado';
                                }
                                unset($producto); // Romper la referencia

                                // Codificar nuevamente a JSON
                                $productosJson = json_encode($productos);

                                // Actualizar el campo productos en la base de datos
                                $sqlUpdateProductos = "UPDATE pedidos SET productos = :productos WHERE idPedido = :idPedido";
                                $sentenciaUpdateProductos = $conexion->prepare($sqlUpdateProductos);
                                $sentenciaUpdateProductos->bindParam(':productos', $productosJson);
                                $sentenciaUpdateProductos->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);

                                if ($sentenciaUpdateProductos->execute()) {
                                    // Confirmar la transacción
                                    $conexion->commit();
                                    echo json_encode(["mensaje" => "Estado del pedido y de los productos actualizados correctamente"]);
                                } else {
                                    // Revertir la transacción en caso de error
                                    $conexion->rollBack();
                                    echo json_encode(["error" => "Error al actualizar los productos: " . implode(", ", $sentenciaUpdateProductos->errorInfo())]);
                                }
                            } else {
                                // Revertir la transacción si el formato JSON no es válido
                                $conexion->rollBack();
                                echo json_encode(["error" => "Formato de productos no válido"]);
                            }
                        } else {
                            // Revertir la transacción si no se encontraron productos
                            $conexion->rollBack();
                            echo json_encode(["error" => "Productos no encontrados para el pedido"]);
                        }
                    } else {
                        // Si el estado no es "Entregado", solo confirmar la actualización del pedido
                        $conexion->commit();
                        echo json_encode(["mensaje" => "Cuenta pedida correctamente"]);
                    }
                } else {
                    // Revertir la transacción en caso de error
                    $conexion->rollBack();
                    echo json_encode(["error" => "Error al actualizar el pedido: " . implode(", ", $sentenciaUpdatePedido->errorInfo())]);
                }
            } catch (Exception $e) {
                // Revertir la transacción en caso de excepción
                $conexion->rollBack();
                echo json_encode(["error" => "Error en la transacción: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["error" => "ID de pedido o estado no proporcionados"]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
