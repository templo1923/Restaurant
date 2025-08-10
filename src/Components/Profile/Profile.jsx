import React, { useEffect, useState, useRef } from 'react';
import logo from '../../images/logo.png'
import './Profile.css'
import { Link as Anchor } from 'react-router-dom';
import baseURL from '../url';
import ShareWeb from '../ShareWeb/ShareWeb'
import NewReservation from '../NewReserva/NewReserva';
export default function Profile() {
    const [tienda, setTienda] = useState([]);
    useEffect(() => {
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
            .catch(error => console.error('Error al cargar datos:', error));
    };


    return (
        <div className='profileContain'>
            {tienda?.imagen1 ? (
                <img src={tienda?.imagen1} alt="logo" />
            ) : (
                <img src={logo} alt="logo" />
            )}
            <h2>{tienda.nombre}</h2>
            <div className='profileText'>
                <p>{tienda.eslogan}</p>
                <Anchor to={`mailto:${tienda.email}`} target="_blank">{tienda.email}</Anchor>
                <Anchor to={`https://www.google.com/maps?q=${encodeURIComponent(tienda.direccion)}`} target="_blank">{tienda.direccion}</Anchor>
                <div className='socials'>
                    <Anchor to={tienda.instagram} target="_blank"><i className='fa fa-instagram'></i></Anchor>
                    <Anchor to={`tel:${tienda.telefono}`} target="_blank"><i className='fa fa-whatsapp'></i></Anchor>
                    <Anchor to={tienda.facebook} target="_blank"><i className='fa fa-facebook'></i></Anchor>
                </div>
            </div>
            <NewReservation />
            <ShareWeb />
        </div>
    )
}
