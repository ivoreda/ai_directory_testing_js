type Listener = (...args: any[]) => void;

class EventEmitter {
    private events: Record<string, Listener[]> = {};

    on(eventName: string, listener: Listener){
        if(!this.events[eventName]){
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
        console.log(`Listener added for event: ${eventName}`);
    }

    emit(eventName: string, ...args: any[]){
        if(!this.events[eventName]){
            console.log(`No listeners for event: ${eventName}`);
            return;
        }
        console.log(`Emitting event: ${eventName} with args ${args} to ${this.events[eventName].length} listener(s)`);
        this.events[eventName].forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                console.error(`Error executing listener for event: ${eventName}`, error);
            }
        });
    }
}

export const eventEmitter = new EventEmitter();