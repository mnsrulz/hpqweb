'use client'

import { Navbar } from 'flowbite-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const RouterLink = ({ href, children }: { href: string, children: any }) => {
    const routerPath = usePathname();
    const active = routerPath == href
    return <Navbar.Link as={Link} href={href} active={active}>{children}</Navbar.Link>
}

export const AppNavBar = () => {
    return <Navbar fluid>
        <Navbar.Toggle />
        <Navbar.Collapse>
            <RouterLink href='/'>Home</RouterLink>
            <RouterLink href='/search'>Search</RouterLink>
            <RouterLink href='/dashboard'>Dashboard</RouterLink>
            <RouterLink href='/raw'>Raw</RouterLink>
        </Navbar.Collapse>
    </Navbar>
}