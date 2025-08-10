import React, { useState, useEffect } from 'react';
import Header from '../Header/Header'
import ReservaData from '../../Components/Admin/ReservaData/ReservaData'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import { useLocation } from 'react-router-dom';
import SinPermisos from '../../Components/SinPermisos/SinPermisos';
import { fetchUsuario, getUsuario } from '../../Components/user';
export default function Reservas() {
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
                                <ReservaData />
                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                <ReservaData />
                            ) : (
                                <SinPermisos />
                            )}
                        </>
                    ) : (
                        <ReservaData />
                    )}

                </div>
            </section>
        </div>
    )
}

