import { Outlet } from 'react-router-dom';
import NavBar from '../components/nav/NavBar';
import Footer from '../components/nav/Footer';

const UserLayout = () => {
    return (
        <div className="flex flex-col justify-between min-h-screen">
            <NavBar />
            <div className="py-12"><Outlet /></div>
            <div className="mt-auto"></div>
            <Footer />
        </div>
    )
}

export default UserLayout;
