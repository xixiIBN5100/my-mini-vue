import { createDep } from "./dep";
import {effectTrigger, ReactiveEffect} from "./effect";

export class ComputedRefImpl {
    public effect

    public _value
    public _dirty = true

    constructor(getter) {
        this.effect = new ReactiveEffect(getter, () => {
            if(!this._value) {
                this._dirty = true
            }
        })
    }

    get() {
        if (this._dirty) {
            this._dirty = false
            this._value = this.effect.run()
            return this._value
        }

        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter)
}
