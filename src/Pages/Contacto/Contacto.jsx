import React, { useState, useEffect } from 'react';
import './Contacto.css'
import Header from '../Header/Header'
import ContactoData from '../../Components/Admin/ContactoData/ContactoData'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import SinPermisos from '../../Components/SinPermisos/SinPermisos';
import { fetchUsuario, getUsuario } from '../../Components/user';
export default function Contacto() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario(); // Llama a la función para obtener datos del usuario
            setLoading(false);
        };

        fetchData();
    }, []);

    const usuarioLegued = getUsuario();
    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>

                <HeaderDash />
                <div className='container'>
                    {loading ? (
                        <></>
                    ) : usuarioLegued?.idUsuario ? (
                        <>
                            {usuarioLegued?.rol === 'admin' ? (
                                <ContactoData />
                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                <SinPermisos />
                            ) : (
                                <SinPermisos />
                            )}
                        </>
                    ) : (
                        <ContactoData />
                    )}
                </div>
            </section>
        </div>
    )
}

