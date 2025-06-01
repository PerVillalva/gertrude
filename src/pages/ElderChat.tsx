import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Send,
    ArrowLeft,
    User,
    Share2,
    Heart,
    FileText,
    Volume2,
    Twitter,
    Facebook,
    Mail,
} from 'lucide-react';
import { elderApi, chatApi, Elder, ChatMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

const ElderChat = () => {
    const { elderId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const [elder, setElder] = useState<Elder | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isDonateOpen, setIsDonateOpen] = useState(false);
    const [audioUrl] = useState<string | null>(null); // Placeholder for audio

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector(
                '[data-radix-scroll-area-viewport]'
            );
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [chatMessages]);

    // Fetch elder data and chat messages
    useEffect(() => {
        const fetchData = async () => {
            if (!elderId) return;

            try {
                setIsInitialLoading(true);

                // Fetch elder details
                const elderData = await elderApi.get(parseInt(elderId));
                setElder(elderData);

                // Fetch existing chat messages
                const messages = await chatApi.getElderMessages(
                    parseInt(elderId)
                );
                setChatMessages(messages);

                // If no messages exist, send an initial greeting
                if (messages.length === 0) {
                    const initialMessage = `Hello! I'm here to help you plan activities for ${elderData.name}. I have detailed information about their preferences and background. What would you like to know or plan for them?`;

                    await chatApi.sendElderMessage(
                        parseInt(elderId),
                        initialMessage,
                        'llm'
                    );

                    // Refresh messages to include the initial greeting
                    const updatedMessages = await chatApi.getElderMessages(
                        parseInt(elderId)
                    );
                    setChatMessages(updatedMessages);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: 'Error',
                    description:
                        'Failed to load elder information. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchData();
    }, [elderId, toast]);

    // Poll for new messages (to catch AI responses)
    useEffect(() => {
        if (!elderId || isInitialLoading) return;

        const pollMessages = async () => {
            try {
                const messages = await chatApi.getElderMessages(
                    parseInt(elderId)
                );
                setChatMessages(messages);
            } catch (error) {
                console.error('Error polling messages:', error);
            }
        };

        // Poll every 2 seconds for new messages
        const interval = setInterval(pollMessages, 2000);

        return () => clearInterval(interval);
    }, [elderId, isInitialLoading]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !elderId) return;

        try {
            setIsLoading(true);

            // Send user message
            await chatApi.sendElderMessage(
                parseInt(elderId),
                newMessage,
                'user'
            );

            // Clear input
            setNewMessage('');

            // Refresh messages immediately to show user message
            const updatedMessages = await chatApi.getElderMessages(
                parseInt(elderId)
            );
            setChatMessages(updatedMessages);

            // Note: AI response will be handled by the polling mechanism
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: 'Error',
                description: 'Failed to send message. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    if (isInitialLoading) {
        return (
            <div
                className='min-h-screen p-6 flex items-center justify-center'
                style={{
                    background:
                        'linear-gradient(to bottom right, #AFD0CD, #EFD492)',
                }}
            >
                <div className='text-[#7F4F61] text-lg'>Loading...</div>
            </div>
        );
    }

    if (!elder) {
        return (
            <div
                className='min-h-screen p-6 flex items-center justify-center'
                style={{
                    background:
                        'linear-gradient(to bottom right, #AFD0CD, #EFD492)',
                }}
            >
                <div className='text-[#7F4F61] text-lg'>Elder not found</div>
            </div>
        );
    }

    return (
        <div
            className='min-h-screen p-0 md:p-6'
            style={{
                background:
                    'linear-gradient(to bottom right, #AFD0CD, #EFD492)',
            }}
        >
            <div className='max-w-6xl mx-auto flex flex-col md:flex-row gap-6'>
                {/* Sidebar */}
                <aside className='md:w-80 w-full md:sticky md:top-8 flex-shrink-0 bg-white/80 rounded-xl shadow p-6 flex flex-col items-center mb-4 md:mb-0'>
                    <div className='w-full flex justify-between items-center mb-4'>
                        {/* Share Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant='ghost'
                                    className='text-[#7F4F61] p-2'
                                >
                                    <Share2 className='h-5 w-5' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='start'>
                                <DropdownMenuItem onClick={handleCopyLink}>
                                    Copy Profile Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                                            window.location.href
                                        )}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center gap-2'
                                    >
                                        <Twitter className='h-4 w-4 text-[#1DA1F2]' />
                                        Twitter (X)
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                            window.location.href
                                        )}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center gap-2'
                                    >
                                        <Facebook className='h-4 w-4 text-[#1877F3]' />
                                        Facebook
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a
                                        href={`mailto:?subject=Check out this Elder's profile&body=${encodeURIComponent(
                                            window.location.href
                                        )}`}
                                        className='flex items-center gap-2'
                                    >
                                        <Mail className='h-4 w-4 text-[#C08777]' />
                                        Email
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {/* Support/Donate Button */}
                        <Dialog
                            open={isDonateOpen}
                            onOpenChange={setIsDonateOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant='ghost'
                                    className='text-[#C08777] p-2'
                                >
                                    <Heart className='h-5 w-5' />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Support {elder.name}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className='py-4 text-center'>
                                    <p className='mb-4'>
                                        This is a placeholder for a donation
                                        feature. Integrate Stripe or your
                                        preferred payment provider here.
                                    </p>
                                    <Button
                                        className='bg-[#C08777] text-white'
                                        disabled
                                    >
                                        Donate (Coming Soon)
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {/* Profile Picture */}
                    <Avatar className='h-32 w-32 mb-4 border-4 border-[#AFD0CD]'>
                        <AvatarFallback className='text-4xl bg-[#EFD492] text-[#7F4F61]'>
                            {elder.name[0]}
                        </AvatarFallback>
                    </Avatar>
                    {/* Elder Summary */}
                    {elder.summary && (
                        <div className='w-full mb-4'>
                            <h3 className='text-[#7F4F61] font-semibold mb-2 text-center'>
                                About {elder.name}
                            </h3>
                            <p className='text-sm text-[#7F4F61] mb-2'>
                                {elder.summary.short_summary}
                            </p>
                        </div>
                    )}
                    {/* Audio/Document Buttons (always visible, disabled if not active) */}
                    <div className='flex flex-col gap-2 w-full mb-4'>
                        <Button
                            asChild
                            variant='outline'
                            className='w-full text-[#7F4F61] border-[#C08777]'
                            disabled={!audioUrl}
                        >
                            <a
                                href={audioUrl || '#'}
                                tabIndex={-1}
                                aria-disabled={!audioUrl}
                                style={{
                                    pointerEvents: audioUrl ? 'auto' : 'none',
                                    opacity: audioUrl ? 1 : 0.5,
                                }}
                            >
                                <Volume2 className='inline mr-2' />
                                Play Original Audio
                            </a>
                        </Button>
                        <Button
                            asChild
                            variant='outline'
                            className='w-full text-[#7F4F61] border-[#C08777]'
                            disabled={true}
                        >
                            <a
                                href={'#'}
                                tabIndex={-1}
                                aria-disabled={true}
                                style={{
                                    pointerEvents: 'none',
                                    opacity: 0.5,
                                }}
                            >
                                <FileText className='inline mr-2' />
                                View Original Document
                            </a>
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className='flex-1 flex flex-col gap-6'>
                    {/* Timeline (horizontal, placeholder) */}
                    <div className='w-full overflow-x-auto mb-4'>
                        <div className='flex items-center gap-8 min-w-[600px] px-2 py-4 bg-white/80 rounded-xl shadow'>
                            {/* Placeholder events */}
                            {[
                                'Born 1942',
                                'Graduated 1964',
                                'Became Librarian 1970',
                                'Retired 2010',
                                'Moved to Community 2022',
                            ].map((event, idx, arr) => (
                                <div key={idx} className='flex items-center'>
                                    <div className='flex flex-col items-center'>
                                        <div className='w-4 h-4 rounded-full bg-[#C08777] mb-1' />
                                        <span className='text-xs text-[#7F4F61] whitespace-nowrap'>
                                            {event}
                                        </span>
                                    </div>
                                    {idx < arr.length - 1 && (
                                        <div className='w-16 h-1 bg-[#AFD0CD] mx-2 rounded' />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Section */}
                    <Card className='bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-[#7F4F61] flex flex-col flex-1 h-[600px]'>
                        <CardHeader>
                            <CardTitle className='text-[#7F4F61]'>
                                Ask me what you'd like to know about{' '}
                                {elder.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col flex-1 p-6 pt-0 min-h-0'>
                            <ScrollArea
                                ref={scrollAreaRef}
                                className='flex-1 pr-4 mb-4 h-full max-h-[400px] overflow-y-auto'
                            >
                                <div className='space-y-4'>
                                    {chatMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${
                                                message.sender === 'user'
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[85%] p-3 rounded-lg ${
                                                    message.sender === 'user'
                                                        ? 'bg-[#C08777] text-white'
                                                        : 'bg-[#AFD0CD]/20 text-[#7F4F61]'
                                                }`}
                                            >
                                                <p className='text-sm leading-relaxed whitespace-pre-line'>
                                                    {message.message}
                                                </p>
                                                <p className='text-xs opacity-70 mt-1'>
                                                    {new Date(
                                                        message.timestamp
                                                    ).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className='flex justify-start'>
                                            <div className='bg-[#AFD0CD]/20 text-[#7F4F61] p-3 rounded-lg'>
                                                <p className='text-sm'>
                                                    Thinking about {elder.name}
                                                    ...
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            <div className='flex space-x-2 pt-4 border-t border-[#AFD0CD]/30 flex-shrink-0'>
                                <Input
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    placeholder={`Ask about activities for ${elder.name}...`}
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && sendMessage()
                                    }
                                    className='border-[#C08777]/30 focus:border-[#C08777]'
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={isLoading || !newMessage.trim()}
                                    className='bg-[#C08777] hover:bg-[#C08777]/90 text-white'
                                >
                                    <Send className='h-4 w-4' />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default ElderChat;
