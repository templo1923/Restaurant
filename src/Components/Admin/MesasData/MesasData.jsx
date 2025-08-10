import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faSync, faPrint } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewMesa from '../NewMesa/NewMesa';
import './MesasData.css';
import moneda from '../../moneda';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import contador from '../../contador'
export default function MesasData() {
    const [mesas, setMesas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [nuevoEstadoPedido, setNuevoEstadoPedido] = useState('');
    const [nuevaMesa, setNuevaMesa] = useState('');
    const [mesa, setMesa] = useState({});
    const [selectedSection, setSelectedSection] = useState('texto');
    const [pedidos, setPedidos] = useState([]);
    const [pedido, setPedido] = useState({});
    const [numeroTelefono, setNumeroTelefono] = useState('');
    const [tienda, setTienda] = useState([]);
    useEffect(() => {
        cargarMesas();
        cargarPedidos();
        cargarTienda();
    }, []);
    const cargarTienda = () => {
        fetch(`${baseURL}/tiendaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setTienda(data.tienda.reverse()[0] || []);
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };
    const cargarPedidos = () => {
        fetch(`${baseURL}/pedidoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setPedidos(data.pedidos.reverse() || []);
                console.log(data.pedidos);
            })
            .catch(error => console.error('Error al cargar pedidos:', error));
    };

    const cargarMesas = () => {
        fetch(`${baseURL}/mesaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setMesas(data.mesas || []);
                console.log(data.mesas);
            })
            .catch(error => console.error('Error al cargar mesas:', error));
    };

    const eliminar = (idMesa) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseURL}/mesaDelete.php?idMesa=${idMesa}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        cargarMesas();
                    })
                    .catch(error => {
                        console.error('Error al eliminar mesa:', error);
                        toast.error(error);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        setMesa(item);
        setNuevoEstado(item.estado);
        setNuevaMesa(item.mesa);

        const mesaPedidos = pedidos.filter(pedido => pedido.idMesa === item.idMesa && pedido.estado !== "Pagado" && pedido.estado !== "Rechazado");
        if (mesaPedidos.length > 0) {
            setPedido(mesaPedidos[0]);
            setNuevoEstadoPedido(mesaPedidos[0].estado);
        } else {
            setPedido({});
            setNuevoEstadoPedido('');
        }

        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };

    const handleUpdateText = (idMesa) => {
        const payload = {
            estado: nuevoEstado !== '' ? nuevoEstado : mesa.estado,
            mesa: nuevaMesa !== '' ? nuevaMesa : mesa.mesa,
        };

        fetch(`${baseURL}/mesaPut.php?idMesa=${idMesa}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire(
                        'Error!',
                        data.error,
                        'error'
                    );
                } else {
                    Swal.fire(
                        'Editado!',
                        data.mensaje,
                        'success'
                    );
                    cargarMesas();
                    cerrarModal();
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };

    const handleUpdateTextPedido = (idPedido) => {
        const payload = {
            estado: nuevoEstadoPedido !== '' ? nuevoEstadoPedido : pedido.estado,
        };

        fetch(`${baseURL}/pedidoPut.php?idPedido=${idPedido}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire(
                        'Error!',
                        data.error,
                        'error'
                    );
                } else {
                    Swal.fire(
                        'Editado!',
                        data.mensaje,
                        'success'
                    );
                    cargarPedidos();
                    cargarMesas();
                    cerrarModal();
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };

    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    const imprimirTicket = (pedido) => {
        const pdf = new jsPDF({
            unit: 'mm',
            format: [80, 150], // Tamaño de ticket estándar
        });

        const total = parseFloat(pedido.total); // Convertir a número
        let productos = [];

        // Verificar si "productos" existe y es un JSON válido antes de intentar parsearlo
        if (pedido.productos) {
            try {
                productos = JSON.parse(pedido.productos);
            } catch (error) {
                console.error("Error al parsear productos:", error);
            }
        }

        // Encabezado del ticket
        pdf.setFontSize(11);
        pdf.text(`${tienda?.nombre}`, 40, 10, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text(`Tel: ${tienda?.telefono}`, 40, 16, { align: 'center' });
        const fechaFormateada = `${new Date(pedido?.createdAt)?.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })} ${new Date(pedido?.createdAt)?.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;

        pdf.text(`Fecha: ${fechaFormateada}`, 40, 22, { align: 'center' });

        let y = 35; // Posición inicial para los datos del pedido

        // Añadir información del pedido al PDF
        pdf.setFontSize(9);
        pdf.text(`ID Pedido: ${pedido.idPedido}`, 5, y);
        pdf.text(`Cliente: ${pedido.nombre}`, 5, y + 5);
        pdf.text(`Teléfono: ${pedido.telefono}`, 5, y + 10);
        pdf.text(`Entrega: ${pedido.entrega}`, 5, y + 15);
        pdf.text(`Pago: ${pedido.pago}`, 5, y + 20);
        // Se eliminó la línea del pago a recibir
        pdf.text(`Estado: ${pedido.estado}`, 5, y + 25);
        pdf.text(`Pagado: ${pedido.pagado}`, 5, y + 30);
        pdf.text(`Código descuento: ${pedido.codigo}`, 5, y + 35);
        pdf.text(`Nota: ${pedido.nota}`, 5, y + 40);
        pdf.text(`------------------------------------------------------------------`, 5, y + 45);
        pdf.text(`Productos:`, 5, y + 49);

        // Añadir productos del pedido si existen
        let yProductos = y + 54;
        if (productos.length > 0) {
            productos.forEach((producto) => {
                const itemsTexto = producto.items && producto.items.length > 0
                    ? producto.items.join(', ')
                    : '';

                const tituloTexto = `- ${producto.titulo} x${producto.cantidad} - ${moneda}${producto.precio} - ${producto.estado} `;
                pdf.setFontSize(9);
                pdf.text(tituloTexto, 5, yProductos);
                yProductos += 5;

                if (itemsTexto) {
                    pdf.setFontSize(8);
                    const itemsArray = pdf.splitTextToSize(`${itemsTexto}`, 75);
                    itemsArray.forEach(line => {
                        pdf.text(line, 5, yProductos);
                        yProductos += 5;
                    });
                }

                if (yProductos > 145) {
                    pdf.addPage();
                    yProductos = 10;
                }
            });
        } else {
            pdf.text('No hay productos.', 5, yProductos);
        }

        y = yProductos + 5;
        pdf.text(`-----------------------------------------------------`, 5, y - 5);
        pdf.setFontSize(10);
        pdf.text(`Total: ${moneda}${total.toFixed(2)}`, 5, y);

        y += 10;
        pdf.text("¡Gracias por su compra!", 40, y, { align: 'center' });

        // Imprimir el ticket
        window.open(pdf.output('bloburl'), '_blank');
    };

    const [counter, setCounter] = useState(contador);
    const [isPaused, setIsPaused] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused) {
                setCounter((prevCounter) => {
                    if (prevCounter === 1) {
                        recargar();
                        return contador;
                    }
                    return prevCounter - 1;
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused]);



    const recargar = () => {
        cargarMesas();
        cargarPedidos();
    };







    return (
        <div >
            <ToastContainer />
            <div className='deFlexBtns'>
                <NewMesa />
                <button className='reload' onClick={recargar}><FontAwesomeIcon icon={faSync} /></button>
            </div>


            {modalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>
                            <div className='deFlexBtnsModal'>
                                <button
                                    className={selectedSection === 'texto' ? 'selected' : ''}
                                    onClick={() => handleSectionChange('texto')}
                                >
                                    Editar Texto
                                </button>

                                <button
                                    className={selectedSection === 'pedido' ? 'selected' : ''}
                                    onClick={() => handleSectionChange('pedido')}
                                >
                                    Ver Pedido
                                </button>

                            </div>
                            <span className="close" onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>

                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>Mesa</legend>
                                    <input
                                        type="text"
                                        value={nuevaMesa !== '' ? nuevaMesa : mesa.mesa}
                                        onChange={(e) => setNuevaMesa(e.target.value)}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Estado</legend>
                                    <select
                                        value={nuevoEstado !== '' ? nuevoEstado : mesa.estado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                    >
                                        <option value="libre">Libre</option>
                                        <option value="ocupada">Ocupada</option>
                                    </select>
                                </fieldset>
                            </div>
                            <button className='btnPost' onClick={() => handleUpdateText(mesa.idMesa)} >Guardar</button>
                        </div>

                        <div className='sectiontext' style={{ display: selectedSection === 'pedido' ? 'flex' : 'none' }}>
                            {
                                pedidos?.filter(item => item.idMesa === mesa.idMesa && mesa.estado === "ocupada").length > 0
                                    ? pedidos?.filter(item => item.idMesa === mesa.idMesa && mesa.estado === "ocupada").slice(0, 1).map(pedido => (
                                        <>
                                            <div key={pedido.idPedido} className='flexGrap'>
                                                <div id='cardsProductData'>
                                                    {JSON.parse(pedido.productos).map(producto => (
                                                        <div key={producto.titulo} className='cardProductData'>
                                                            <img src={producto.imagen} alt="imagen" />
                                                            <div className='cardProductDataText'>
                                                                <h5 style={{
                                                                    color: '#FFFFFF',  // Color del texto en blanco
                                                                    backgroundColor: producto.estado === 'Pendiente' ? '#DAA520' :
                                                                        producto.estado === 'Preparacion' ? '#0000FF' :
                                                                            producto.estado === 'Rechazado' ? '#FF0000' :
                                                                                producto.estado === 'Entregado' ? '#008000' :
                                                                                    '#3366FF',  // Color de fondo basado en el estado del producto
                                                                    padding: '3px',  // Padding de 3px
                                                                    textAlign: 'center',  // Alineación centrada
                                                                    borderRadius: '3px',  // Bordes redondeados de 3px
                                                                    width: '5rem'
                                                                }}>
                                                                    {producto.estado}
                                                                </h5>
                                                                <h3>{producto.titulo}</h3>
                                                                <strong>{moneda} {producto.precio} <span>x{producto.cantidad}</span></strong>
                                                                <span>
                                                                    {producto?.items?.map((sabor, index) => (
                                                                        <span key={index}>{sabor}, </span>
                                                                    ))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <fieldset>
                                                    <legend>ID Pedido</legend>
                                                    <input
                                                        value={pedido.idPedido}
                                                        disabled
                                                    />
                                                </fieldset>
                                                <fieldset>
                                                    <legend>Fecha </legend>
                                                    <input
                                                        value={new Date(pedido?.createdAt)?.toLocaleString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                        disabled

                                                    />
                                                </fieldset>

                                                <fieldset>
                                                    <legend>Nombre</legend>
                                                    <input
                                                        value={pedido.nombre}
                                                        disabled
                                                    />
                                                </fieldset>
                                                <fieldset>
                                                    <legend>Telefono</legend>
                                                    <input
                                                        value={pedido.telefono}
                                                        disabled
                                                    />
                                                </fieldset>
                                                <fieldset>
                                                    <legend>Pago</legend>
                                                    <input
                                                        value={pedido.pago}
                                                        disabled
                                                    />
                                                </fieldset>
                                                <fieldset>
                                                    <legend>Entrega </legend>
                                                    {
                                                        mesas?.filter(mesa => mesa?.idMesa === pedido?.idMesa).length > 0
                                                            ? mesas?.filter(mesa => mesa?.idMesa === pedido?.idMesa).map(mapeomesa => (
                                                                <input
                                                                    key={mapeomesa.idMesa}
                                                                    value={mapeomesa.mesa}
                                                                    disabled
                                                                />

                                                            ))
                                                            : (
                                                                <input
                                                                    key={pedido.entrega}
                                                                    value={pedido.entrega}
                                                                    disabled
                                                                />

                                                            )
                                                    }
                                                </fieldset>
                                                <fieldset>
                                                    <legend>Codigo</legend>
                                                    <input
                                                        value={pedido.codigo}
                                                        disabled
                                                    />
                                                </fieldset>
                                                <fieldset>
                                                    <legend>Nota</legend>
                                                    <input
                                                        value={pedido.nota}
                                                        disabled
                                                    />
                                                </fieldset>

                                                <fieldset>
                                                    <legend>Total </legend>
                                                    <input
                                                        value={pedido.total}
                                                        disabled
                                                    />
                                                </fieldset>

                                                <button onClick={() => imprimirTicket(pedido)} className='btnPost'>
                                                    <FontAwesomeIcon icon={faPrint} />
                                                </button>
                                            </div>

                                            {/* <button className='btnPost' onClick={() => handleUpdateTextPedido(pedido.idPedido)} >Guardar </button> */}


                                        </>
                                    ))
                                    : <div className='noHay'><p>No hay pedidos</p></div>
                            }
                        </div>
                    </div>
                </div>
            )}

            <div className='mesasGrap'>
                {mesas.map(item => (
                    <div className={`cardMesa ${item.estado === 'libre' ? 'bg-green' : 'bg-red'}`} key={item.idMesa}>
                        <div className='deFLexBtnMesa'>
                            <button className='eliminar' onClick={() => eliminar(item.idMesa)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <h4>{item.estado}</h4>
                            <button className='editar' onClick={() => abrirModal(item)}>
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                        </div>
                        <h3>{item.mesa}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};
