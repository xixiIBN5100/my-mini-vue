

export const reactiveMap = new WeakMap()
export const readonlyMap = new WeakMap()
export const shallowReadonlyMap = new WeakMap()


export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly",
    RAW = "__v_raw"
}
export function createReactiveObject(target,proxyMap,handle) {
    const existingProxy = proxyMap.get(target)
    if(existingProxy) {
        return existingProxy
    }
    const proxy = new Proxy(target,handle)
    proxyMap.set(target,proxy)
    return proxy
}

export function reactive(target) {
    return createReactiveObject(target, reactiveMap, mutableHandlers);
}

export function readonly(target) {
    return createReactiveObject(target, readonlyMap, readonlyHandlers);
}

export function shallowReadonly(target) {
    return createReactiveObject(
        target,
        shallowReadonlyMap,
        shallowReadonlyHandlers
    );
}

export function isProxy(value) {
    return !!value[ReactiveFlags.IS_REACTIVE] || value[ReactiveFlags.IS_READONLY]
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadOnly(value) {
    return value[ReactiveFlags.IS_READONLY]
}

export function toRaw(value) {
    if(!value[ReactiveFlags.RAW]) {
        return value
    }

    return value[ReactiveFlags.RAW]
}