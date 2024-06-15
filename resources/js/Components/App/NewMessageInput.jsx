import React, { useEffect, useRef} from "react";

const NewMessageInput = ({ value, onChange, onSend}) => {
    const inputRef = useRef(null);
    const input = useRef();

    const onInputkeyDown = (ev) => {
        if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            onSend();
        }
    }

    const onChangeEvent = (ev) => {
        setTimeout(() =>{
            adjustHeight
        }, 10);
        onChange(ev);
    };

    const adjustHeight = () => {
        setTimeout(() =>{
           input.current.style.height = "auto";
           input.current.style.height = input.current.scrollHeight + 1 + "px";
        }, 10);
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={input}
            value={value}
            rows = "1"
            placeholder="Type a message"
            onKeyDown={onInputkeyDown}
            onChange={(ev) => onChange(ev)}
            className="input input-bordered w-full rounded-r-none resize-none overflow-auto max-h-40"
         ></textarea>
    );
};

export default NewMessageInput;