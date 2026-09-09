import Link from "next/link";

export default function NavBar() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50stick">
        <div className="bg-gray-800 text-white text-center p-4
            flex justify-around 
         "> 
            <Link href="/" className="hover:underline">
        inicio
            </Link>
           <Link href="/./Fed" className="hover:underline">
                fed
             </Link>

             <Link href="/./criacao" className="hover:underline">
                Criação
             </Link>

              <Link href="/./administracao" className="hover:underline">
                Administração
             </Link>

            
        </div>
    </div>
    )
}