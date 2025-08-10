import React, { useState, useEffect } from 'react';
import './NewContact.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import Swal from 'sweetalert2';
import { fetchUsuario, getUsuario } from '../../user';
export default function NewContact() {
    const [mensaje, setMensaje] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [instagram, setInstagram] = useState('');
    const [email, setEmail] = useState('');
    const [direccion, setDireccion] = useState('');
    const [facebook, setFacebook] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const toggleModal = () => {
        setTelefono('');
        setInstagram('');
        setEmail('');
        setDireccion('');
        setFacebook('');
        setMensaje('');
        setModalOpen(!modalOpen);
    };

    const crear = async () => {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('telefono', telefono);
        formData.append('instagram', instagram);
        formData.append('email', email);
        formData.append('direccion', direccion);
        formData.append('facebook', facebook);

        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/contactoPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.mensaje) {
                setMensaje('');
                toast.success(data.mensaje);
                toggleModal();
                window.location.reload();
            } else if (data.error) {
                setMensaje('');
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            toast.error('Error de conexión. Por favor, inténtelo de nuevo.');
        }
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
        <div className='NewContain'>
            <ToastContainer />
            {loading ? (
                <></>
            ) : usuarioLegued?.idUsuario ? (
                <>
                    {usuarioLegued?.rol === 'admin' ? (
                        <button onClick={toggleModal} className='btnSave'>
                            <span>+</span> Agregar
                        </button>
                    ) : usuarioLegued?.rol === 'colaborador' ? (
                        <button onClick={alertPermiso} className='btnSave'>
                            <span>  +</span>   Agregar
                        </button>
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <button onClick={toggleModal} className='btnSave'>
                    <span>+</span> Agregar
                </button>
            )}

            {modalOpen && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Contacto</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <form className='flexGrap'>
                            <fieldset>
                                <legend>Nombre de negocio (obligatorio)</legend>
                                <input
                                    type='text'
                                    name='nombre'
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Telefono (obligatorio)</legend>
                                <input
                                    type='text'
                                    name='telefono'
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Email (obligatorio)</legend>
                                <input
                                    type='email'
                                    name='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Dirección (obligatorio)</legend>
                                <input
                                    type='text'
                                    name='direccion'
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Instagram link (opcional)</legend>
                                <input
                                    type='url'
                                    name='instagram'
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>facebook link (opcional)</legend>
                                <input
                                    type='text'
                                    name='facebook'
                                    value={facebook}
                                    onChange={(e) => setFacebook(e.target.value)}
                                />
                            </fieldset>


                            {mensaje ? (
                                <button type='button' className='btnLoading' disabled>
                                    {mensaje}
                                </button>
                            ) : (
                                <button type='button' onClick={crear} className='btnPost'>
                                    Agregar
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
