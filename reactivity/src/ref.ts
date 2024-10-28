import { trackEffects, effectTrigger, isTracking } from "./effect";
import { createDep } from "./dep";
import { reactive } from "./reactive";

export class refImp {
    public _rawValue = undefined
    public _value = undefined
    public dep;
    public _is_ref = true

    constructor(value) {
        this._rawValue = value
        this._value = handle(value)

        this.dep = createDep()
    }

    get value() {
        if(isTracking()) {
            trackEffects(this.dep)
        }
        return this._value
    }

    set value(newValue) {
        if(newValue !== this._rawValue) {
            this._rawValue = newValue
            this._value = handle(newValue)
            effectTrigger(this.dep)
        }

    }
}

export function handle (value) {
    return typeof value === 'object' ? reactive(value) : value
}

export function ref(value) {
    return new refImp(value)
}

export function unWarp(value){
    return isRef(value) ? value._rawValue : value
}

export function isRef(value) {
    return !!value._is_ref
}

export const shallowUnwrapHandlers = {
    get(target,key,reciver) {
        return unWarp(Reflect.get(target,key,reciver))
    },

    set(target,key,value,reciver) {
        const oldValue = target[key]
        if(isRef(oldValue) && !isRef(value)) {
            return (target[key].value = value)
        } else {
            return Reflect.set(target,key,value,reciver)
        }
    }
}

export function proxyRefs(refs){
    const proxy = new Proxy(refs,shallowUnwrapHandlers)

    return proxy
}