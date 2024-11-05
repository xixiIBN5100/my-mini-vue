import {PublicInstanceProxyHandlers} from "./componentPublicInstance";

let compile
export function setRuntimeCompile (_complie) {
    compile = _complie
}

let currentInstance = {}
export function setCurrentInstance (instance) {
    currentInstance = instance
}

export function getCurrentInstance(): any {
    return currentInstance;
}

export function createComponentInstance(vnode, parent) {
    const instance = {
        type: vnode.type,
        vnode,
        next: null, // 需要更新的 vnode，用于更新 component 类型的组件
        props: {},
        parent,
        provides: parent ? parent.provides : {}, //  获取 parent 的 provides 作为当前组件的初始化值 这样就可以继承 parent.provides 的属性了
        proxy: null,
        isMounted: false,
        attrs: {}, // 存放 attrs 的数据
        slots: {}, // 存放插槽的数据
        ctx: {}, // context 对象
        setupState: {}, // 存储 setup 的返回值
        emit: () => {},
    };

    instance.ctx = {
        _: instance,
    };
    instance.emit = emit.bind(null, instance) as any;
    return instance;
}

export function setupComponent (instance) {
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
    const { props, children } = instance.vnode;
    initProps(instance, props);
    // 2. 处理 slots
    initSlots(instance, children);
    setupStatefulComponent(instance);
}

export function setupStatefulComponent (instance) {
    const setupCxt = createSetupCxt(instance)
    setCurrentInstance(instance)
    const { setup } = instance.type
    if(setup) {
        const setupRes = setup(instance.props,setupCxt)
        setCurrentInstance(null);
        handleSetupRes(instance,setupRes)
    } else {
        finishSetup(instance)
    }

}

export function createSetupCxt (instance) {
    return {
        attrs: instance.attrs,
        emit: instance.emit,
        slots: instance.slots
    }
}

export function handleSetupRes(instance,setupRes) {
    if(typeof setupRes === 'function') {
        instance.render = setupRes
    } else if(typeof setupRes === 'object') {
        instance.setupState = setupRes
    }
    finishSetup(instance)
}

export function finishSetup (instance) {
    const component = instance.type
    if(!instance.render) {
        if(compile && component.template) {
            const template = component.template
            component.render = compile(template);
        }
        instance.render = component.render;
    }
}