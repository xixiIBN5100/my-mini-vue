import { track, trigger } from "./effect";
import {
    reactive,
    ReactiveFlags,
    reactiveMap,
    readonly,
    readonlyMap,
    shallowReadonlyMap,
} from "./reactive";

export function createGetter(shallow = false, isReadonly = false) {
    return function get(target,key,reciver) {
        const existingReactiveMap = () => {
            return key === ReactiveFlags.RAW && reciver === reactiveMap.get(target)
        }
        const existingReadonlyMap = () => {
           return key === ReactiveFlags.RAW && reciver === readonlyMap.get(target)
        }
        const existingShallowReadonlyMap = () => {
            return key === ReactiveFlags.RAW && reciver === shallowReadonlyMap.get(target)
        }

        if(key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        } else if (
            existingReactiveMap() ||
            existingReadonlyMap() ||
            existingShallowReadonlyMap()
        ) {
            return target
        }

        if (!isReadonly) {
            // 在触发 get 的时候进行依赖收集
            track(target, "get", key);
        }
        const res = Reflect.get(target,key,reciver)

        if (shallow) {
            return res
        }

        if (typeof res === 'object') {
            return isReadonly? readonly(res): reactive(res)
        }

        return res
    }
}

const get = createGetter();
const readonlyGetter = createGetter(false,true);
const shallowReadonlyGetter = createGetter(true,true)
const set = createSetter()

export function createSetter() {
    return function set(target,key,value,recivier) {
        const res = Reflect.set(target,key,value,recivier)

        trigger(target,'set',key)
        return res;
    }
}

export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGetter,
    set: () => {
        console.log("readOnly")
        return true
    }
}

export const shallowReadonlyHandlers = {
    get: shallowReadonlyGetter,
    set: () => {
        console.log("readOnly")
        return true
    }
}