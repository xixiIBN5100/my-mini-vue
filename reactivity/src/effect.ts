import {createDep} from "./dep";

let shouldTrack = false
let activeEffect = undefined;
// @ts-ignore
let targetMap = new WeakMap();

export class ReactiveEffect{
    deps = [];
    active = true;
    public onStop?: () => void;

    constructor(public fn: Function, public scheduler?: Function) {
        console.log("创建ReactiveEffect对象")
    }

    run(){
        if (!this.active) {
            return this.fn();
        }

        activeEffect = this as any
        shouldTrack = true
        const res = this.fn()
        activeEffect = undefined
        shouldTrack = false

        return res
    }

    stop () {
        if (this.active) {
            cleanUp(this)

            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }

}

function cleanUp (effect) {
    effect.deps.forEach( dep => dep.delete(effect) )

    effect.deps.length = 0
}

export function effect (fn, options = {}) {
    const _effect = new ReactiveEffect(fn)

    Object.assign(_effect,options)
    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function stop (runner) {
    runner.effect.stop()
}

export function track (target, type, key) {

    if(!isTracking()) {
        return
    }
    let depsMap = targetMap.get(target)

    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)

    if (!dep) {
        dep = createDep();
        depsMap.set(key,dep)
    }

    trackEffects(dep)
}

export function trackEffects (dep) {
    if(!dep.has(activeEffect)) {
        dep.add(activeEffect);
        (activeEffect as any).deps.push(dep)
    }
}


export function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}

export function trigger (target,type,key) {
    let deps:any[] = []
    const depsMap = targetMap.get(target)

    const dep = depsMap.get(key)
    deps.push(dep)
    const effects = []
    deps.forEach( dep => {
        effects.push(...dep)
    })

    effectTrigger(createDep(effects))
}

function effectTrigger ( effects)  {
    for(const effect of effects) {
        if(effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

