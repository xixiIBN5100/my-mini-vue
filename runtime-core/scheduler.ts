const queue: any[] = [];
const activePreFlushCbs: any = [];
const p = Promise.resolve()
let isFlushing = false

export function nextTick (fn?) {
    return fn ? p.then(fn) : p
}

export function queueJob (job) {
    if(!queue.includes(job)) {
        queue.push(job)
        queueFlush()
    }
}

export function queueFlush () {
    if (isFlushing) return
    isFlushing = false

    nextTick(flushJob)
}

export function queuePreFlushCb (cb) {
    queueCb(cb, activePreFlushCbs)
}

export function queueCb (cb, activePreFlushCbs) {
    activePreFlushCbs.push(cb)
    queueFlush()
}

export function flushJob() {
    isFlushing = false

    flushPreFlushCbs();

    let job
    while(job = queue.shift()) {
        if(job) {
            job()
        }
    }
}

export function flushPreFlushCbs () {
    for(let i = 0;i < activePreFlushCbs.length;i++) {
        activePreFlushCbs[i]()
    }
}