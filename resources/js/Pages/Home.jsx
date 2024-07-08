import ChatLayout from '@/Layouts/ChatLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import { useEventBus } from '@/EventBus';
import axios from 'axios';
import AttachmentsPreviewModal from '@/Components/App/AttachmentsPreviewModal';


function Home({ selectedConversation = null, messages = null }) {
    const [localMessages, setLocalMessages] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] =useState(0);
    const messagesCtrRef = useRef(null);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const loadMoreIntersect = useRef(null);
    const { on } =  useEventBus();

    const messageCreated = (message) => {
        console.log(selectedConversation);
        if(
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ){
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
        if(
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id || selectedConversation.id == message.receiver_id)
        ){
           
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
    };


    const messageDeleted = (message) => {
        if(
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ){
            setLocalMessages((prevMessages) => {
                return prevMessages.filter((m) => m.id != message.id);
            });
            
        }
        if(
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id || selectedConversation.id == message.receiver_id)
        ){
           
            setLocalMessages((prevMessages) => {
                return prevMessages.filter((m) => m.id != message.id);
            });
        }
    };


    const loadMoreMessages = useCallback(() => {

        if(noMoreMessages){
            return;
        }
        // find the firsty message object
        const firstMessage = localMessages[0];
        axios
            .get(route("message.loadOlder" , firstMessage.id))
            .then(({ data }) => {
                if (data.data.length ===  0) {
                    setNoMoreMessages(true);
                    return;
                }
                // Calculate how much is scrolled from the bottom and  sroll to the same postion
                //from bottom after message are loaded
                const scrollHeight  = messagesCtrRef.current.scrollHeight;
                const scrollTop = messagesCtrRef.current.scrollTop;
                const clientHeight = messagesCtrRef.current.clientHeight;
                const tmpScrollFromBottom = 
                    scrollHeight - scrollTop - clientHeight;
                    console.log("tmpSxcrollFromBottom", tmpScrollFromBottom);
                    setScrollFromBottom(scrollHeight - scrollTop - clientHeight);

                    setLocalMessages((prevMessages) => {
                        return [...data.data.reverse(), ...prevMessages]; 
                    });
            });
    },[localMessages, noMoreMessages]);

    const onAttachmentClick = (attachments, ind) => {
        setPreviewAttachment({
            attachments,
            ind,
        });
        setShowAttachmentPreview(true);
    };


    useEffect(() => {
        setTimeout(() => {
            if(messagesCtrRef.current){
                messagesCtrRef.current.scrollTop =
                messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated  = on("message.created", messageCreated);
        const offDeleted  = on("message.deleted", messageDeleted);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            offCreated();
            offDeleted();
        }
    },[selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

    useEffect(() => {
        if(messagesCtrRef.current && scrollFromBottom !== null ){
            messagesCtrRef.current.scrollTop =                                                                                                                      
             messagesCtrRef.current.scrollHeight -
             messagesCtrRef.current.offsetHeight -
                scrollFromBottom;
        }

        if(noMoreMessages){
            return;
        }

        const observer = new IntersectionObserver(
            (entries) =>
            entries.forEach(
                (entry) => entry.isIntersecting && loadMoreMessages()
            ),
            {
                rootMargin: "0px 0px 250px 0px",
            }
        );

        if(loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100); 
        }

        return () => {
            observer.disconnect();
        };
    },[localMessages]);

    return (
        <>
        {!messages && (
            <div className="flex flex-col gap-8 justify-center items-center  text-center
                            h-full opacity-35">
                <div className="text-2xl md:text-4xl p-16 text-slate-200">
                    Please select conversation to see message
                </div>
                <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block" />
            </div>
        )}
        {messages && (
            <>
                <ConversationHeader
                    selectedConversation={selectedConversation}
                 />
                 <div
                    ref={messagesCtrRef}
                    className="flex-1 overflow-y-auto p-5"
                    >
                        {/* Messages */}
                        {localMessages.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                No Message found
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className="flex-1 flex flex-col">
                                <div ref={loadMoreIntersect}></div>
                                {localMessages.map((message) => (
                                     <MessageItem
                                     key={message.id}
                                     message={message}
                                 />
                                ))}
                            </div>
                        )}
                    </div>
                <MessageInput conversation={selectedConversation} />
            </>
        )}
        {previewAttachment.attachments && (
            <AttachmentsPreviewModal
                attachments={previewAttachment.attachments}
                index={previewAttachment.ind}
                show={showAttachmentPreview}
                onClose={() => setShowAttachmentPreview(false)}
            />
        )}
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