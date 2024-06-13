import ChatLayout from '@/Layouts/ChatLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useState } from 'react';


function Home({ messages }) {
    cosnt [localMessages, setLocalMessages] = useState([]);

    useEffect(() => {
        setLocalMessages(messages)
    }, [messages]);
    return (
        <>
        Messages
       </>
   
    );
    
}

Home.layout = (page) => {
    return(
        <AuthenticatedLayout
        user={page.props.auth.user}>
            <ChatLayout  children={page} />
        </AuthenticatedLayout>
    );
}

export default Home;