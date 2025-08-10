import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import baseURL from '../url';
import './NewReserva.css';

Modal.setAppElement('#root');

export default function NewReservation() {
    const [mensaje, setMensaje] = useState('');
    const [nombre, setNombre] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [fecha, setFecha] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    // Generar un array de números del 1 al 100
    const opcionesCantidad = Array.from({ length: 100 }, (_, i) => i + 1);

    const toggleModal = () => {
        setNombre('');
        setCantidad('');
        setFecha('');
        setMensaje('');
        setModalOpen(!modalOpen);
    };

    const crearReserva = async () => {
        // Convertir la fecha al formato correcto
        const fechaFormateada = fecha.replace('T', ' ') + ':00';

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('cantidad', cantidad);
        formData.append('estado', 'Reservado');
        formData.append('fecha', fechaFormateada);

        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/reservaPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.mensaje) {
                setMensaje('');
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: data.mensaje,
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
                toggleModal();
            } else if (data.error) {
                setMensaje('');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error,
                    showConfirmButton: true,
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'Por favor, inténtelo de nuevo.',
                showConfirmButton: true,
            });
        }
    };

    return (
        <div className="NewReservation">
            <button onClick={toggleModal} className="btnSave">
                Realizar Reserva
            </button>
            <Modal
                isOpen={modalOpen}
                className="modalCenter"
                overlayClassName="overlayCenter"
                onRequestClose={toggleModal}
            >
                <div className="deFLex">
                    <button onClick={toggleModal}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <button onClick={toggleModal} className="deleteToCart">
                        Realizar Reserva
                    </button>
                </div>
                <form className="modal-send-form">
                    <input
                        type="text"
                        name="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Apellido y Nombre (*)"
                    />

                    <select
                        name="cantidad"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Cantidad de personas
                        </option>
                        {opcionesCantidad.map((numero) => (
                            <option key={numero} value={numero}>
                                {numero}
                            </option>
                        ))}
                    </select>

                    <input
                        type="datetime-local"
                        name="fecha"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                    {mensaje ? (
                        <button type="button" className="btn" disabled>
                            {mensaje}
                        </button>
                    ) : (
                        <button type="button" onClick={crearReserva} className="btn">
                            Agregar
                        </button>
                    )}
                </form>
            </Modal>
        </div>
    );
}
