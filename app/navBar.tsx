'use client'


import { Sidebar } from 'flowbite-react';
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from 'react-icons/hi';

import { Navbar } from 'flowbite-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { socket } from './lib/socket'
import React from 'react';

const RouterLink = ({ href, children }: { href: string, children: any }) => {
    const routerPath = usePathname();
    const active = routerPath == href
    return <Navbar.Link as={Link} href={href} active={active}>{children}</Navbar.Link>
}

const ConnectionStatus = (props: { isConnected: boolean, transportName: string }) => {
    const { isConnected, transportName } = props;
    return <span className='mx-1'>| Connected: <span>{transportName}</span> -- {isConnected ? 'true' : 'false'}</span>
}

export const AppNavBar = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [transport, setTransport] = useState(socket.io.engine.transport.name);
    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        const onUpgrade = () => {
            console.log(`upgraded to ${socket.io.engine.transport.name}`)
            setTransport(socket.io.engine.transport.name);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('upgrade', onUpgrade)

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return <Navbar fluid>
            <Navbar.Toggle />
            <Navbar.Collapse>
                <RouterLink href='/'>Home</RouterLink>
                <RouterLink href='/search'>Search</RouterLink>
                <RouterLink href='/dashboard'>Dashboard</RouterLink>
                <RouterLink href='/raw'>Raw</RouterLink>
            </Navbar.Collapse>
            <ConnectionStatus isConnected={isConnected} transportName={transport} />
        </Navbar>
}
