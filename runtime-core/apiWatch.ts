import { queuePreFlushCb } from "./scheduler";
import { ReactiveEffect } from "@vue/reactivity";

export function watchEffect(effect) {
    return doWatch(effect)
}

function doWatch (source) {
    const job = () => {
        effect.run()
    }

    const schedule = () => queuePreFlushCb(job)

    let cleanup
    const onCleanup = (fn) =>{
        cleanup = effect.onStop = () => {
            fn()
        }
    }

    const getter = () => {
        if(cleanup) {
            cleanup()
        }

        source(onCleanup)
    }

    const effect = new ReactiveEffect(getter,schedule)

    effect.run()

    return () => {
        effect.stop();
    };
}