import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './ContactoData.css'
import 'jspdf-autotable';
import baseURL from '../../url';
import NewContact from '../NewContact/NewContact';
import { fetchUsuario, getUsuario } from '../../user';
export default function ContactoData() {
    const [contactos, setContactos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoTelefono, setNuevoTelefono] = useState('');
    const [nuevoInstagram, setNuevoInstagram] = useState('');
    const [nuevoEmail, setNuevoEmail] = useState('');
    const [nuevaDireccion, setNuevaDieccion] = useState('');
    const [nuevofacebook, setNuevofacebook] = useState('');
    const [contacto, setContacto] = useState({});
    const [selectedSection, setSelectedSection] = useState('texto');

    useEffect(() => {
        cargarContacto();

    }, []);


    const cargarContacto = () => {
        fetch(`${baseURL}/contactoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setContactos(data.contacto || []);
                console.log(data.contacto)
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };

    const editar = (idContacto) => {
        // Reemplaza el window.confirm con SweetAlert2
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
                fetch(`${baseURL}/contactoDelete.php?idContacto=${idContacto}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        cargarContacto();
                    })
                    .catch(error => {
                        console.error('Error al eliminar contacto:', error);
                        toast.error(error);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        setContacto(item);
        setNuevoNombre(item.nombre);
        setNuevoTelefono(item.telefono);
        setNuevoInstagram(item.instagram);
        setNuevoEmail(item.email);
        setNuevaDieccion(item.direccion);
        setNuevofacebook(item.facebook);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };



    const handleUpdateText = (idContacto) => {
        const payload = {
            nombre: nuevoNombre !== '' ? nuevoNombre : contacto.nombre,
            telefono: nuevoTelefono !== '' ? nuevoTelefono : contacto.telefono,
            instagram: nuevoInstagram !== undefined ? nuevoInstagram : contacto.instagram,
            email: nuevoEmail !== '' ? nuevoEmail : contacto.email,
            direccion: nuevaDireccion !== '' ? nuevaDireccion : contacto.direccion,
            facebook: nuevofacebook !== undefined ? nuevofacebook : contacto.facebook,
        };

        fetch(`${baseURL}/contactoPut.php?idContacto=${idContacto}`, {
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
                    cargarContacto();
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
    //Trae usuario logueado-----------------------------
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario();
            setLoading(false);
        };

        fetchData();
    }, []);
    const usuarioLegued = getUsuario();
    const alertPermiso = () => {
        Swal.fire(
            '¡Error!',
            '¡No tienes permisos!',
            'error'
        );
    }
    return (
        <div>

            <ToastContainer />

            <NewContact />





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

                            </div>
                            <span className="close" onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>
                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>Nombre de negocio (obligatorio)</legend>
                                    <input
                                        type="text"
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Telefono  (obligatorio)</legend>
                                    <input
                                        type="number"
                                        value={nuevoTelefono}
                                        onChange={(e) => setNuevoTelefono(e.target.value)}
                                    />
                                </fieldset>

                                <fieldset >
                                    <legend>Email  (obligatorio)</legend>
                                    <input
                                        type="email"
                                        value={nuevoEmail}
                                        onChange={(e) => setNuevoEmail(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset >
                                    <legend>Direccion  (obligatorio)</legend>
                                    <input
                                        type="text"
                                        value={nuevaDireccion}
                                        onChange={(e) => setNuevaDieccion(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Instagram  link (opcional)</legend>
                                    <input
                                        type="url"
                                        value={nuevoInstagram}
                                        onChange={(e) => setNuevoInstagram(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset >
                                    <legend>Facebook  link (opcional)</legend>
                                    <input
                                        type="text"
                                        value={nuevofacebook}
                                        onChange={(e) => setNuevofacebook(e.target.value)}
                                    />
                                </fieldset>
                            </div>




                            <button className='btnPost' onClick={() => handleUpdateText(contacto.idContacto)} >Guardar </button>

                        </div>




                    </div>
                </div>
            )}
            <div className='table-container'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Telefono</th>
                            <th>Instagram</th>
                            <th>Facebook</th>
                            <th>Email</th>
                            <th>Direccion</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contactos.map(item => (
                            <tr key={item.idContacto}>
                                <td>{item.nombre}</td>
                                <td>{item.telefono}</td>
                                <td>{item.instagram}</td>
                                <td>{item.facebook}</td>
                                <td>{item.email}</td>
                                <td>{item.direccion}</td>
                                <td>
                                    {loading ? (
                                        <></>
                                    ) : usuarioLegued?.idUsuario ? (
                                        <>
                                            {usuarioLegued?.rol === 'admin' ? (
                                                <>
                                                    <button className='eliminar' onClick={() => editar(item.idContacto)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button className='editar' onClick={() => abrirModal(item)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                </>
                                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                                <>
                                                    <button className='eliminar' onClick={alertPermiso}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button className='editar' onClick={alertPermiso}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button className='eliminar' onClick={() => editar(item.idContacto)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                            <button className='editar' onClick={() => abrirModal(item)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                        </>
                                    )}

                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
};
