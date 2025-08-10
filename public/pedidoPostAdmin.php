<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $estado = $_POST['estado'];
        $productos = json_decode($_POST['productos'], true);
        $total = $_POST['total'];
        $nombre = $_POST['nombre'];
        $telefono = $_POST['telefono'];
        $entrega = $_POST['entrega'];
        $nota = $_POST['nota'];
        $codigo = $_POST['codigo'];
        $pago = $_POST['pago'];
        $pagado = $_POST['pagado'];
        $pagoRecibir = $_POST['pagoRecibir'];
        $createdAt = $_POST['createdAt'];
        $idMesa = $_POST['idMesa'];

        if (!empty($estado) && !empty($productos) && !empty($total)  && !empty($entrega) && !empty($pagado)  && !empty($createdAt) && !empty($pago) && !empty($idMesa)) {
            
            if (!empty($codigo)) {
                $sqlCodigo = "SELECT tipo, descuento, desde, hasta, limite, idCategoria, productos FROM codigos WHERE codigo = :codigo";
                $stmtCodigo = $conexion->prepare($sqlCodigo);
                $stmtCodigo->bindParam(':codigo', $codigo);
                $stmtCodigo->execute();
                $codigoData = $stmtCodigo->fetch(PDO::FETCH_ASSOC);

                if ($codigoData) {
                    $fechaActual = date('Y-m-d H:i:s');

                    if ($fechaActual >= $codigoData['desde'] && $fechaActual <= $codigoData['hasta']) {
                        $sqlContarUsos = "SELECT COUNT(*) as cantidad FROM pedidos WHERE codigo = :codigo";
                        $stmtContarUsos = $conexion->prepare($sqlContarUsos);
                        $stmtContarUsos->bindParam(':codigo', $codigo);
                        $stmtContarUsos->execute();
                        $usosData = $stmtContarUsos->fetch(PDO::FETCH_ASSOC);
                        $cantidadUsos = $usosData['cantidad'];
                        $limite = $codigoData['limite'];

                        if ($limite == 0 || $cantidadUsos < $limite) {
                            $productosCodigo = json_decode($codigoData['productos'], true);
                            $idCategoriaCodigo = $codigoData['idCategoria'];

                            $aplicable = false;

                            foreach ($productos as $producto) {
                                if (!empty($productosCodigo)) {
                                    foreach ($productosCodigo as $productoCodigo) {
                                        if ($producto['idProducto'] == $productoCodigo['idProducto']) {
                                            $aplicable = true;
                                            break 2;
                                        }
                                    }
                                }

                                if (!empty($idCategoriaCodigo) && !empty($producto['idCategoria'])) {
                                    if ($producto['idCategoria'] == $idCategoriaCodigo) {
                                        $aplicable = true;
                                        break;
                                    }
                                }
                            }

                            if ($aplicable) {
                                $tipo = $codigoData['tipo'];
                                $descuento = $codigoData['descuento'];

                                if ($tipo == 'porcentaje') {
                                    $total -= ($total * ($descuento / 100));
                                } elseif ($tipo == 'fijo') {
                                    $total -= $descuento;
                                }
                            } 
                        }
                    }
                }
            }

            if ($total < 0) {
                $total = 0;
            }

            $sqlInsertPedido = "INSERT INTO `pedidos` (estado, productos, total, nombre, telefono, entrega, nota, codigo, pago, pagado, pagoRecibir, idMesa, createdAt) 
            VALUES (:estado, :productos, :total, :nombre, :telefono, :entrega, :nota, :codigo, :pago, :pagado, :pagoRecibir, :idMesa, :createdAt)";
            $stmtPedido = $conexion->prepare($sqlInsertPedido);
            $stmtPedido->bindParam(':estado', $estado);
            $stmtPedido->bindParam(':productos', $_POST['productos']);
            $stmtPedido->bindParam(':total', $total);
            $stmtPedido->bindParam(':nombre', $nombre);
            $stmtPedido->bindParam(':telefono', $telefono);
            $stmtPedido->bindParam(':entrega', $entrega); 
            $stmtPedido->bindParam(':nota', $nota);
            $stmtPedido->bindParam(':codigo', $codigo);
            $stmtPedido->bindParam(':pago', $pago);
            $stmtPedido->bindParam(':pagado', $pagado);
            $stmtPedido->bindParam(':pagoRecibir', $pagoRecibir);
            $stmtPedido->bindParam(':idMesa', $idMesa);
            $stmtPedido->bindParam(':createdAt', $createdAt);
            $stmtPedido->execute();

            $lastPedidoId = $conexion->lastInsertId();

            // Actualizar el estado de la mesa a "ocupada"
            $sqlActualizarMesa = "UPDATE mesas SET estado = 'ocupada' WHERE idMesa = :idMesa";
            $stmtActualizarMesa = $conexion->prepare($sqlActualizarMesa);
            $stmtActualizarMesa->bindParam(':idMesa', $idMesa);
            $stmtActualizarMesa->execute();

            echo json_encode([
                "mensaje" => "$nombre, tu pedido es el N°$lastPedidoId",
                "idPedido" => $lastPedidoId,
                "estado" => $estado,
                "productos" => $productos,
                "total" => $total,
                "nombre" => $nombre,
                "telefono" => $telefono,
                "entrega" => $entrega,
                "nota" => $nota,
                "codigo" => $codigo,
                "pago" => $pago,
                "pagado" => $pagado,
                "pagoRecibir" => $pagoRecibir,
                "createdAt" => $createdAt
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
