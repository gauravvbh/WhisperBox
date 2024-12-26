'use client'


import { signOut, useSession } from 'next-auth/react'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
const Navbar = () => {

    const { data: session } = useSession()
    const router = useRouter();


    return (
        <nav className='p-4 md:p-6 shadow-md'>
            <div className='container mx-auto flex md:flex-row justify-between items-center'>
                <a className='text-xl font-bold md:mb-0' href="/">Mystery Message</a>
                {
                    session ? (
                        <>
                            <div className='hidden md:flex gap-5'>
                                <Button className='w-full md:w-auto' onClick={() => router.push('/dashboard')}>My Dashboard</Button>
                                <Button className='w-full md:w-auto' onClick={() => signOut()}>Logout</Button>
                            </div>
                            <div className='md:hidden mr-5'>
                                <NavigationMenu>
                                    <NavigationMenuList>
                                        <NavigationMenuItem>
                                            <NavigationMenuTrigger className='text-lg bg-black text-white font-extralight'>Menu</NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <Link href="/" legacyBehavior passHref>
                                                    <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-xl mt-3 mb-2`}>
                                                        Home
                                                    </NavigationMenuLink>
                                                </Link>
                                                <Link href="/dashboard" legacyBehavior passHref>
                                                    <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-xl mb-2`}>
                                                        Dashboard
                                                    </NavigationMenuLink>
                                                </Link>
                                                <NavigationMenuLink asChild>
                                                    <button
                                                        className={`${navigationMenuTriggerStyle()} text-xl mb-3`}
                                                        onClick={() => signOut()}
                                                    >
                                                        Logout
                                                    </button>
                                                </NavigationMenuLink>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    </NavigationMenuList>
                                </NavigationMenu>

                            </div>
                        </>
                    ) : (
                        <Link href='/sign-in'>
                            <Button className='w-full md:w-auto'>Login</Button>
                        </Link>
                    )
                }
            </div>
        </nav>
    )
}

export default Navbar