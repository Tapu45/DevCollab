import { clientSubscription, pusherClient } from '@/utils/Pusher';
import { useEffect, useState } from 'react';

type PusherEvent<T = any> = {
    channelName: string;
    eventName: string;
    callback: (data: T) => void;
};

export function usePusherEvent<T = any>({ channelName, eventName, callback }: PusherEvent<T>) {
    useEffect(() => {
        const channel = clientSubscription(channelName);

        channel.bind(eventName, callback);

        return () => {
            channel.unbind(eventName, callback);
            // Only unsubscribe if no more listeners
            if (channel.callbacks._callbacks[eventName]?.length === 0) {
                pusherClient.unsubscribe(channelName);
            }
        };
    }, [channelName, eventName, callback]);
}

// For more complex usage with state
export function usePusherData<T = any>(channelName: string, eventName: string, initialData?: T) {
    const [data, setData] = useState<T | undefined>(initialData);

    useEffect(() => {
        const channel = clientSubscription(channelName);

        channel.bind(eventName, (newData: T) => {
            setData(newData);
        });

        return () => {
            channel.unbind(eventName);
            // Only unsubscribe if no more listeners
            if (Object.keys(channel.callbacks._callbacks).length === 0) {
                pusherClient.unsubscribe(channelName);
            }
        };
    }, [channelName, eventName]);

    return data;
}