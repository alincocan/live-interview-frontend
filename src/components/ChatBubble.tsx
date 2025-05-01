interface ChatBubbleProps {
    text: string;
}

export function ChatBubble({ text }: ChatBubbleProps) {
    return (
        <div style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '10px',
            maxWidth: '300px',
            textAlign: 'center'
        }}>
            {text}
        </div>
    );
}