import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import baseURL from '../../url';

export default function ReservaData() {
    const [reservas, setReservas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [reserva, setReserva] = useState({});
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevaCantidad, setNuevaCantidad] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [nuevaFecha, setNuevaFecha] = useState('');

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = () => {
        fetch(`${baseURL}/reservaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setReservas(data.reservas || []);
            })
            .catch(error => console.error('Error al cargar reservas:', error));
    };

    const eliminarReserva = (idReserva) => {
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
                fetch(`${baseURL}/reservaDelete.php?idReserva=${idReserva}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire('¡Eliminado!', data.mensaje, 'success');
                        cargarReservas();
                    })
                    .catch(error => {
                        console.error('Error al eliminar reserva:', error);
                        toast.error(error);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        setReserva(item);
        setNuevoNombre(item.nombre);
        setNuevaCantidad(item.cantidad);
        setNuevoEstado(item.estado);
        // Convertir fecha al formato compatible con datetime-local
        const fechaISO = new Date(item.fecha).toISOString();
        setNuevaFecha(fechaISO.substring(0, 19)); // Extraer 'YYYY-MM-DDTHH:mm:ss'
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };
    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Añade el cero si es menor a 10
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const actualizarReserva = (idReserva) => {
        const payload = {
            nombre: nuevoNombre !== '' ? nuevoNombre : reserva.nombre,
            cantidad: nuevaCantidad !== '' ? nuevaCantidad : reserva.cantidad,
            estado: nuevoEstado !== '' ? nuevoEstado : reserva.estado,
            fecha: nuevaFecha !== '' ? formatearFecha(nuevaFecha) : formatearFecha(reserva.fecha),
            idReserva: reserva.idReserva
        };

        fetch(`${baseURL}/reservaPut.php?idReserva=${idReserva}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire('Error!', data.error, 'error');
                } else {
                    Swal.fire('Editado!', data.mensaje, 'success');
                    cargarReservas();
                    cerrarModal();
                }
            })
            .catch(error => {
                console.error('Error al actualizar reserva:', error);
                toast.error(error.message);
            });
    };


    return (
        <div>
            <ToastContainer />
            {modalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Editar Texto</button>
                            <span className="close" onClick={cerrarModal}>&times;</span>
                        </div>
                        <div className="form">
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>Nombre</legend>
                                    <input
                                        type="text"
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset >
                                    <legend>Cantidad</legend>
                                    <select
                                        id='AnchoSelect'
                                        value={nuevaCantidad}
                                        onChange={(e) => setNuevaCantidad(e.target.value)}
                                    >
                                        {/* Crear las opciones del 1 al 100 */}
                                        {Array.from({ length: 100 }, (_, index) => index + 1).map((cantidad) => (
                                            <option key={cantidad} value={cantidad}>
                                                {cantidad}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>

                                <fieldset >
                                    <legend>Estado</legend>
                                    <select
                                        id='AnchoSelect'
                                        value={nuevoEstado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                    >
                                        <option value="Reservado">Reservado</option>
                                        <option value="Cancelado">Cancelado</option>
                                        <option value="Finalizado">Finalizado</option>
                                    </select>
                                </fieldset>
                                <fieldset>
                                    <legend>Fecha</legend>
                                    <input
                                        type="datetime-local"
                                        value={nuevaFecha}
                                        onChange={(e) => setNuevaFecha(e.target.value)}
                                    />
                                </fieldset>
                            </div>
                            <button className='btnPost' onClick={() => actualizarReserva(reserva.idReserva)}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Cantidad</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map((item) => (
                            <tr key={item.idReserva}>
                                <td>{item.nombre}</td>
                                <td>{item.cantidad}</td>
                                <td style={{
                                    color: item.estado === 'Reservado' ? '#DAA520' :
                                        item.estado === 'Cancelado' ? '#FF0000' :
                                            item.estado === 'Finalizado' ? '#008000' :
                                                '#3366FF'
                                }}>
                                    {item?.estado}
                                </td>
                                <td> {new Date(item?.fecha)?.toLocaleString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}</td>
                                <td>
                                    <button className='eliminar' onClick={() => eliminarReserva(item.idReserva)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <button className='editar' onClick={() => abrirModal(item)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
