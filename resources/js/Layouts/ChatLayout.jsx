import { usePage } from "@inertiajs/react";
import Echo from "laravel-echo";
import { useEffect, useState } from "react";


const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversations = page.props.selectedCoversations;
    const [localConversation, setLocalConversatioin] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [onlineUSers, setOnlineUsers] =  useState({});

    const isUserOnline = (userId) => onlineUSers[userId];

    console.log("conversations", conversations);
    console.log("selectedConversations", selectedConversations);

    

    useEffect(()=> {
        Echo.join("online")
            .here((users)=> {
              const onlineUsersObj = Object.fromEntries(
                users.map((user)=> [user.id, user])
              );

              setOnlineUsers((prevOnlineUsers) => {
                return { ...prevOnlineUsers, ...onlineUsersObj }
              });
            })
            .joining((user)=> {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers =  { ...prevOnlineUsers};
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                })
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers};
                    delete updatedUsers[user.id];
                    return updatedUsers;
                })
            })
            .error((error) => {
                console.error("error", error);
            });
        return () => {
            Echo.leave("online");
        }

    }, []);

    return (
    <>
        ChatLayout
        <div>{children}</div>
    </>
    );
    
}


export default ChatLayout