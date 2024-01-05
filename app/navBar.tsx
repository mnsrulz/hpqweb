'use client'

import { Navbar } from 'flowbite-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { socket } from './lib/socket'

const RouterLink = ({ href, children }: { href: string, children: any }) => {
    const routerPath = usePathname();
    const active = routerPath == href
    return <Navbar.Link as={Link} href={href} active={active}>{children}</Navbar.Link>
}

export const AppNavBar = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    
    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

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
        <span className='mx-1'>| Connected: { isConnected ? 'true' : 'false' }</span> 
    </Navbar>
}